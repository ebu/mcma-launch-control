const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { Logger } = require("@mcma/core");

const AWS = require("aws-sdk");
const awsCodeCommit = new AWS.CodeCommit();
const CodeCommit = {
    getRepository: util.promisify(awsCodeCommit.getRepository.bind(awsCodeCommit)),
    createRepository: util.promisify(awsCodeCommit.createRepository.bind(awsCodeCommit)),
    deleteRepository: util.promisify(awsCodeCommit.deleteRepository.bind(awsCodeCommit))
};

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
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY });
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitUserEmail = async (email) => {
    let cmd = "git config user.email \"" + email + "\"";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY });
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitPushDefault = async () => {
    let cmd = "git config push.default simple";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY });
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitConfig = async (username, email) => {
    await gitUsername(username);
    await gitUserEmail(email);
    await gitPushDefault();
};

const gitAddFiles = async () => {
    let cmd = "git add -A";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY });
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitCommit = async (message) => {
    let cmd = "git commit -am \"" + message + "\"";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY });
    Logger.info("stdout:", stdout);
    Logger.info("stderr:", stderr);
};

const gitPush = async () => {
    let cmd = "git push";
    Logger.info(cmd);
    const { stdout, stderr } = await exec(cmd, { "cwd": REPO_DIRECTORY });
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

module.exports = {
    CodeCommit,
    gitInit,
    gitClone,
    gitConfig,
    gitAddFiles,
    gitCommit,
    gitPush,
    listRepo,
    removeRepo,
    REPO_DIRECTORY
};