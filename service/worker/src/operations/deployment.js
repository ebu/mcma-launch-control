const util = require('util');
const exec = util.promisify(require('child_process').exec);
const writeFile = util.promisify(require('fs').writeFile);

const { URL } = require("url");

const { Logger } = require("@mcma/core");

const { McmaDeploymentStatus } = require("commons");
const { DataController } = require("data");

const { CodeCommit } = require("./codecommit");

const GIT_USERNAME = process.env.AwsCodeCommitUsername;
const GIT_PASSWORD = process.env.AwsCodeCommitPassword;

const REPO_DIRECTORY = "/tmp/repo";

let gitInitialized = false;

const gitInit = async () => {
    if (!gitInitialized) {
        try {
            await require("lambda-git")();
            gitInitialized = true;
            let cmd = "git --version";
            Logger.info(cmd);
            const { stdout, stderr } = await exec(cmd);
            Logger.info("stdout:", stdout);
            Logger.info("stderr:", stderr);
        } catch (error) {
            Logger.error("Failed to initialize git", error);
            throw error;
        }
    }
};

const gitClone = async (httpsUrl) => {
    let cmd = "git clone " + httpsUrl + " " + REPO_DIRECTORY;
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd);
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitUsername = async (username) => {
    let cmd = "git config user.name \"" + username + "\"";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY});
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitUserEmail = async (email) => {
    let cmd = "git config user.email \"" + email + "\"";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY});
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitAddFiles = async () => {
    let cmd = "git add -A";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY});
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitCommit = async (message) => {
    let cmd = "git commit -am \"" + message + "\"";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY});
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitPush = async () => {
    let cmd = "git push";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY});
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const listRepo = async () => {
    let cmd = "find " + REPO_DIRECTORY;
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd);
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const removeRepo = async () => {
    let cmd = "rm -rf " + REPO_DIRECTORY;
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd);
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
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
        await gitInit();

        let repositoryName = project.name;

        let repoData = await CodeCommit.getRepository({ repositoryName });

        Logger.info(JSON.stringify(repoData, null, 2));

        await removeRepo();

        let repoUrl = new URL(repoData.repositoryMetadata.cloneUrlHttp);
        repoUrl.username = GIT_USERNAME;
        repoUrl.password = GIT_PASSWORD;
        await gitClone(repoUrl.toString());

        await writeFile(REPO_DIRECTORY + "/test.txt", "Hello World!");

        await listRepo();

        await gitUsername("Launch Control");
        await gitUserEmail("launch-control@mcma.ebu.ch");
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