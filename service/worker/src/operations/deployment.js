const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { Logger } = require("@mcma/core");

const { McmaDeploymentStatus } = require("commons");
const { DataController } = require("data");

const { CodeCommit } = require("./codecommit");

let gitInitialized = false;

const initGit = async () => {
    if (!gitInitialized) {
        try {
            await require("lambda-git")();
            gitInitialized = true;
            const { stdout, stderr } = await exec("git --version");
            Logger.info("stdout:", stdout);
            Logger.info("stderr:", stderr);
        } catch (error) {
            Logger.error("Failed to initialize git", error);
            throw error;
        }
    }
};

const updateDeployment = async (workerRequest) => {
    let dc = new DataController(workerRequest.tableName());

    let project = await dc.getProject(workerRequest.input.projectId);
    let deployment = await dc.getDeployment(workerRequest.input.deploymentId);

    if (!project || !deployment) {
        Logger.warn("Project and/or deploying missing", project, deployment);
        return;
    }

    try {
        await initGit();

        let repositoryName = project.name;

        let repository = await CodeCommit.getRepository({ repositoryName });

        Logger.info(repository);

        deployment.status = McmaDeploymentStatus.OK;
    } catch (error) {
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