const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const writeFile = util.promisify(require('fs').writeFile);

const { URL } = require("url");

const { Logger } = require("@mcma/core");

const { McmaDeploymentStatus } = require("commons");
const { DataController } = require("data");

const { REPO_DIRECTORY, CodeCommit, gitInit, gitClone, gitConfig, gitAddFiles, gitCommit, gitPush, removeRepo, listRepo } = require("./codecommit");

const GIT_USERNAME = process.env.AwsCodeCommitUsername;
const GIT_PASSWORD = process.env.AwsCodeCommitPassword;

const updateDeployment = async (workerRequest) => {
    let dc = new DataController(workerRequest.tableName());

    let project = await dc.getProject(workerRequest.input.projectId);
    let deployment = await dc.getDeployment(workerRequest.input.deploymentId);

    if (!project || !deployment) {
        Logger.warn("Project and/or deploying missing", project, deployment);
        return;
    }

    try {
        await gitInit();

        let repositoryName = project.name;

        let repoData = await CodeCommit.getRepository({ repositoryName });

        Logger.info(JSON.stringify(repoData, null, 2));

        await removeRepo();

        let repoUrl = new URL(repoData.repositoryMetadata.cloneUrlHttp);
        repoUrl.username = GIT_USERNAME;
        repoUrl.password = GIT_PASSWORD;
        await gitClone(repoUrl.toString());
        await gitConfig("Launch Control", "launch-control@mcma.ebu.ch");

        await writeFile(REPO_DIRECTORY + "/" + Date.now() + ".txt", "Hello World!");

        await listRepo();

        await gitAddFiles();
        await gitCommit("Adding a file");
        await gitPush();

        deployment.status = McmaDeploymentStatus.OK;
    } catch (error) {
        Logger.warn(error);
        deployment.status = McmaDeploymentStatus.ERROR;
    }

    await dc.setDeployment(deployment);
};

const deleteDeployment = async (workerRequest) => {
    // let dc = new DataController(workerRequest.tableName());

    Logger.info(workerRequest);
};

module.exports = {
    updateDeployment,
    deleteDeployment
};