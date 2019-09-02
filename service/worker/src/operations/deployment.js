const { URL } = require("url");

const { Logger } = require("@mcma/core");

const { McmaDeploymentStatus } = require("commons");
const { DataController } = require("data");

const { CodeCommit } = require("./tools/codecommit");
const { Terraform } = require("./tools/terraform");
const { Git } = require("./tools/git");

const REPOSITORY_DIR = "/tmp/repo";

// const AWS_ACCOUNT_ID = process.env.AwsAccountId;
const AWS_ACCESS_KEY = process.env.AwsAccessKey;
const AWS_SECRET_KEY = process.env.AwsSecretKey;
const AWS_REGION = process.env.AwsRegion;

const GIT_USERNAME = process.env.AwsCodeCommitUsername;
const GIT_PASSWORD = process.env.AwsCodeCommitPassword;

const generateGitIgnore = () => ".terraform\n" +
    ".terraform.tfstate.lock.info\n" +
    "terraform.tfstate.backup\n" +
    "terraform.tfvars.json\n";

const generateMainTfJson = () => {
    let mainTfJson = {
        terraform: {
            required_version: ">= 0.12.0",
            backend: {
                local: {}
            }
        },

        provider: [
            {
                aws: {
                    version: "~> 2.25",
                    access_key: "${var.aws_access_key}",
                    secret_key: "${var.aws_secret_key}",
                    region: "${var.aws_region}",
                }
            }
        ],

        module: [
            {
                aws_s3_bucket: {
                    source: "https://s3-eu-west-1.amazonaws.com/pt.rovers.mcma.launch-control.repository/aws_s3_bucket.zip",
                    bucket_name: "ch.ebu.mcma.test-bucket.${var.deployment_config_name}"
                }
            }
        ]
    };

    return JSON.stringify(mainTfJson, null, 2);
};

generateVariablesTfJson = () => {
    let variablesTfJson = {
        variable: [
            {
                aws_access_key: {},
                aws_secret_key: {},
                aws_region: {},
                deployment_config_name: {}
            }
        ]
    };

    return JSON.stringify(variablesTfJson, null, 2);
};

generateTerraformTfVarsJson = (deploymentConfig) => {
    let terraformTfVarsJson = {
        aws_access_key: AWS_ACCESS_KEY,
        aws_secret_key: AWS_SECRET_KEY,
        aws_region: AWS_REGION,
        deployment_config_name: deploymentConfig.name
    };
    return JSON.stringify(terraformTfVarsJson, null, 2);
};

const getRepositoryUrl = async (project) => {
    let repositoryName = project.name;
    let repoData = await CodeCommit.getRepository({ repositoryName });

    Logger.info(JSON.stringify(repoData, null, 2));

    let repoUrl = new URL(repoData.repositoryMetadata.cloneUrlHttp);
    repoUrl.username = GIT_USERNAME;
    repoUrl.password = GIT_PASSWORD;
    return repoUrl.toString();
};

const updateDeployment = async (workerRequest) => {
    try {
        Logger.info("updateDeployment", JSON.stringify(workerRequest, null, 2));
        let dc = new DataController(workerRequest.tableName());

        let project = await dc.getProject(workerRequest.input.projectId);
        let deployment = await dc.getDeployment(workerRequest.input.deploymentId);
        let deploymentConfig = await dc.getDeploymentConfig(workerRequest.input.deploymentConfigId);

        Logger.info(JSON.stringify(project, null, 2));
        Logger.info(JSON.stringify(deployment, null, 2));
        Logger.info(JSON.stringify(deploymentConfig, null, 2));

        if (!project || !deploymentConfig || !deployment) {
            Logger.warn("Project, DeploymentConfig and/or Deployment missing from DynamoDB Table");
            return;
        }

        try {
            Git.setWorkingDir(REPOSITORY_DIR);
            Terraform.setWorkingDir(REPOSITORY_DIR);

            let repoUrl = await getRepositoryUrl(project);

            await Git.clone(repoUrl);
            await Git.config("Launch Control", "launch-control@mcma.ebu.ch");

            await Git.writeFile(".gitignore", generateGitIgnore());
            await Git.writeFile("main.tf.json", generateMainTfJson());
            await Git.writeFile("variables.tf.json", generateVariablesTfJson());
            await Git.writeFile("terraform.tfvars.json", generateTerraformTfVarsJson(deploymentConfig));

            await Git.addFiles();
            if (await Git.hasChanges()) {
                await Git.pull();
                await Git.commit("Updating Terraform configuration");
                await Git.push();
            }

            await Terraform.init(deploymentConfig.name);
            await Terraform.apply();

            await Git.addFiles();
            if (await Git.hasChanges()) {
                await Git.pull();
                await Git.commit("Deployment '" + deploymentConfig.name + "' is updated");
                await Git.push();
            }

            deployment.status = McmaDeploymentStatus.OK;
        } catch (error) {
            Logger.error(error);
            deployment.status = McmaDeploymentStatus.ERROR;
            deployment.statusMessage = error.message;
        }

        await dc.setDeployment(deployment);
    } catch (error) {
        Logger.error(error);
    }
};

const deleteDeployment = async (workerRequest) => {
    try {
        Logger.info("deleteDeployment", JSON.stringify(workerRequest, null, 2));
        let dc = new DataController(workerRequest.tableName());

        let project = await dc.getProject(workerRequest.input.projectId);
        let deployment = await dc.getDeployment(workerRequest.input.deploymentId);
        let deploymentConfig = await dc.getDeploymentConfig(workerRequest.input.deploymentConfigId);

        Logger.info(JSON.stringify(project, null, 2));
        Logger.info(JSON.stringify(deployment, null, 2));
        Logger.info(JSON.stringify(deploymentConfig, null, 2));

        if (!project || !deploymentConfig || !deployment) {
            Logger.warn("Project, DeploymentConfig and/or Deployment missing from DynamoDB Table");
            return;
        }

        try {
            Git.setWorkingDir(REPOSITORY_DIR);
            Terraform.setWorkingDir(REPOSITORY_DIR);

            let repoUrl = await getRepositoryUrl(project);

            await Git.clone(repoUrl);
            await Git.config("Launch Control", "launch-control@mcma.ebu.ch");

            await Git.writeFile("terraform.tfvars.json", generateTerraformTfVarsJson(project, deploymentConfig));

            await Terraform.init(deploymentConfig.name);
            await Terraform.destroy();

            await Git.addFiles();
            if (await Git.hasChanges()) {
                await Git.pull();
                await Git.commit("Deployment '" + deploymentConfig.name + "' is destroyed");
                await Git.push();
            }

            await dc.deleteDeployment(deployment.id);
        } catch (error) {
            Logger.warn(error);
            deployment.status = McmaDeploymentStatus.ERROR;
            deployment.statusMessage = error.message;
            await dc.setDeployment(deployment);
        }
    } catch (error) {
        Logger.error(error);
    }
};

module.exports = {
    updateDeployment,
    deleteDeployment
};