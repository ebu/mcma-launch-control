const util = require('util');
const exec = util.promisify(require('child_process').exec);
const writeFile = util.promisify(require('fs').writeFile);

const { Logger } = require("@mcma/core");

const GIT = "git";

const options = {};

let gitInitialized = false;

class Git {
    static setWorkingDir(workingDir) {
        options.cwd = workingDir;
    }

    static async init() {
        if (!gitInitialized) {
            try {
                await require("lambda-git")();
                gitInitialized = true;
            } catch (error) {
                Logger.error("Failed to initialize git", error);
                throw error;
            }
        }
    }

    static async version() {
        await Git.init();

        let cmd = GIT + " --version";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
        return stdout;
    }


    static async clone(httpsUrl) {
        await Git.init();

        {
            let cmd = "rm -rf " + options.cwd;
            Logger.info(cmd);
            const { stdout, stderr } = await exec(cmd);
            Logger.info("stdout:", stdout);
            Logger.info("stderr:", stderr);
        }
        {
            let cmd = "git clone " + httpsUrl + " " + options.cwd;
            Logger.info(cmd);
            const { stdout, stderr } = await exec(cmd);
            Logger.info("stdout:", stdout);
            Logger.info("stderr:", stderr);
        }
    }

    static async config(username, email) {
        await Git.init();

        {
            let cmd = "git config user.name \"" + username + "\"";
            Logger.info(cmd);
            const { stdout, stderr } = await exec(cmd, options);
            Logger.info("stdout:", stdout);
            Logger.info("stderr:", stderr);
        }
        {
            let cmd = "git config user.email \"" + email + "\"";
            Logger.info(cmd);
            const { stdout, stderr } = await exec(cmd, options);
            Logger.info("stdout:", stdout);
            Logger.info("stderr:", stderr);
        }
        {
            let cmd = "git config push.default simple";
            Logger.info(cmd);
            const { stdout, stderr } = await exec(cmd, options);
            Logger.info("stdout:", stdout);
            Logger.info("stderr:", stderr);
        }
    }

    static async addFiles() {
        await Git.init();

        let cmd = "git add -A";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
    }

    static async isNew() {
        await Git.init();

        let cmd = "git rev-parse HEAD &> /dev/null || echo 1";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);

        return !!stdout;
    }

    static async hasChanges() {
        await Git.init();

        let cmd = "git diff-index --quiet HEAD -- || echo 1";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);

        return !!stdout;
    }

    static async commit(message) {
        await Git.init();

        let cmd = "git commit -am \"" + message + "\"";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
    }

    static async pull() {
        await Git.init();

        let cmd = "git pull";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
    }

    static async push() {
        await Git.init();

        let cmd = "git push";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
    }

    static async listFiles() {
        let cmd = "find " + options.cwd;
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
    }

    static async writeFile(filename, content) {
        await writeFile(options.cwd + "/" + filename, content);
    }
}

module.exports = {
    Git
};