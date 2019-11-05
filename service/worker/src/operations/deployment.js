const { URL } = require("url");

const { McmaDeploymentStatus } = require("commons");
const { DataController } = require("data");

const { CodeCommit } = require("./tools/codecommit");
const { Terraform } = require("./tools/terraform");
const { Git } = require("./tools/git");

const REPOSITORY_DIR = "/tmp/repo";

const GLOBAL_PREFIX = process.env.GlobalPrefix;

const AWS_ACCOUNT_ID = process.env.AwsAccountId;
const AWS_ACCESS_KEY = process.env.AwsAccessKey;
const AWS_SECRET_KEY = process.env.AwsSecretKey;
const AWS_REGION = process.env.AwsRegion;

const GIT_USERNAME = process.env.AwsCodeCommitUsername;
const GIT_PASSWORD = process.env.AwsCodeCommitPassword;

const generateGitIgnore = () => ".terraform\n" +
    ".terraform.tfstate.lock.info\n" +
    "terraform.tfstate.backup\n" +
    "terraform.tfvars.json\n";

const generateMainTfJson = (components) => {
    let providers = [];

    providers.push({
        aws: {
            version: "~> 2.25",
            access_key: "${var.aws_access_key}",
            secret_key: "${var.aws_secret_key}",
            region: "${var.aws_region}",
        }
    });

    let modules = [];

    for (const component of components) {
        let variables = {};

        for (const variable in component.variables) {
            if (component.variables.hasOwnProperty(variable)) {
                variables[variable] = component.variables[variable];
            }
        }

        variables.source = component.module;

        let module = {};
        module[component.name] = variables;
        component.variables;

        modules.push(module)
    }

    let mainTfJson = {
        terraform: {
            required_version: ">= 0.12.0",
            backend: {
                local: {}
            }
        },
        provider: providers,
        module: modules
    };

    return JSON.stringify(mainTfJson, null, 2);
};

generateVariablesTfJson = () => {
    let variablesTfJson = {
        variable: [
            {
                project_prefix: {},
                stage_name: {},
                aws_account_id: {},
                aws_access_key: {},
                aws_secret_key: {},
                aws_region: {}
            }
        ]
    };

    return JSON.stringify(variablesTfJson, null, 2);
};

generateTerraformTfVarsJson = (project, deploymentConfig) => {
    let terraformTfVarsJson = {
        project_prefix: GLOBAL_PREFIX + "." + project.name + "." + deploymentConfig.name,
        stage_name: deploymentConfig.name,
        aws_account_id: AWS_ACCOUNT_ID,
        aws_access_key: AWS_ACCESS_KEY,
        aws_secret_key: AWS_SECRET_KEY,
        aws_region: AWS_REGION
    };
    return JSON.stringify(terraformTfVarsJson, null, 2);
};

const getRepositoryUrl = async (project) => {
    let repositoryName = project.name;
    let repoData = await CodeCommit.getRepository({ repositoryName });

    console.log(JSON.stringify(repoData, null, 2));

    let repoUrl = new URL(repoData.repositoryMetadata.cloneUrlHttp);
    repoUrl.username = GIT_USERNAME;
    repoUrl.password = GIT_PASSWORD;
    return repoUrl.toString();
};

const updateDeployment = async (providerCollection, workerRequest) => {
    try {
        console.log("updateDeployment", JSON.stringify(workerRequest, null, 2));
        let dc = new DataController(workerRequest.tableName());

        let project = await dc.getProject(workerRequest.input.projectId);
        let deployment = await dc.getDeployment(workerRequest.input.deploymentId);
        let deploymentConfig = await dc.getDeploymentConfig(workerRequest.input.deploymentConfigId);
        let components = await dc.getComponents(workerRequest.input.projectId);

        console.log(JSON.stringify(project, null, 2));
        console.log(JSON.stringify(deployment, null, 2));
        console.log(JSON.stringify(deploymentConfig, null, 2));

        if (!project || !deploymentConfig || !deployment) {
            console.warn("Project, DeploymentConfig and/or Deployment missing from DynamoDB Table");
            return;
        }

        let errorMessage = null;

        try {
            Git.setWorkingDir(REPOSITORY_DIR);
            Terraform.setWorkingDir(REPOSITORY_DIR);

            let repoUrl = await getRepositoryUrl(project);

            await Git.clone(repoUrl);
            await Git.config("Launch Control", "launch-control@mcma.ebu.ch");

            let isNewRepository = await Git.isNew();

            await Git.writeFile(".gitignore", generateGitIgnore());
            await Git.writeFile("main.tf.json", generateMainTfJson(components));
            await Git.writeFile("variables.tf.json", generateVariablesTfJson());
            await Git.writeFile("terraform.tfvars.json", generateTerraformTfVarsJson(project, deploymentConfig));

            await Git.addFiles();
            if (isNewRepository || await Git.hasChanges()) {
                if (!isNewRepository) {
                    await Git.pull();
                }
                await Git.commit("Updating Terraform configuration");
                await Git.push();
            }

            try {
                await Terraform.init(deploymentConfig.name);
                await Terraform.apply();
            } catch (error) {
                errorMessage = error.message;
            }

            await Git.addFiles();
            if (await Git.hasChanges()) {
                await Git.pull();
                await Git.commit("Deployment '" + deploymentConfig.name + "' is updated " + (errorMessage ? "with errors during deployment" : "successfully"));
                await Git.push();
            }

            deployment.status = errorMessage ? McmaDeploymentStatus.ERROR : McmaDeploymentStatus.OK;
            deployment.statusMessage = errorMessage;
        } catch (error) {
            console.error(error);
            deployment.status = McmaDeploymentStatus.ERROR;
            deployment.statusMessage = error.message;
        }

        await dc.setDeployment(deployment);
    } catch (error) {
        console.error(error);
    }
};

const deleteDeployment = async (providerCollection, workerRequest) => {
    try {
        console.log("deleteDeployment", JSON.stringify(workerRequest, null, 2));
        let dc = new DataController(workerRequest.tableName());

        let project = await dc.getProject(workerRequest.input.projectId);
        let deployment = await dc.getDeployment(workerRequest.input.deploymentId);
        let deploymentConfig = await dc.getDeploymentConfig(workerRequest.input.deploymentConfigId);

        console.log(JSON.stringify(project, null, 2));
        console.log(JSON.stringify(deployment, null, 2));
        console.log(JSON.stringify(deploymentConfig, null, 2));

        if (!project || !deploymentConfig || !deployment) {
            console.warn("Project, DeploymentConfig and/or Deployment missing from DynamoDB Table");
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
            console.warn(error);
            deployment.status = McmaDeploymentStatus.ERROR;
            deployment.statusMessage = error.message;
            await dc.setDeployment(deployment);
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    updateDeployment,
    deleteDeployment
};
