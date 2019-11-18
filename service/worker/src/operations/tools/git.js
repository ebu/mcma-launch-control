const util = require('util');
const exec = util.promisify(require('child_process').exec);
const writeFile = util.promisify(require('fs').writeFile);

const GIT = "git";

const options = {};

class Git {
    static setWorkingDir(workingDir) {
        options.cwd = workingDir;
    }

    static async version() {
        let cmd = GIT + " --version";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
        return stdout;
    }


    static async clone(httpsUrl) {
        {
            let cmd = "rm -rf " + options.cwd;
            console.log(cmd);
            const { stdout, stderr } = await exec(cmd);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
        {
            let cmd = "git clone " + httpsUrl + " " + options.cwd;
            console.log(cmd);
            const { stdout, stderr } = await exec(cmd);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
    }

    static async config(username, email) {
        {
            let cmd = "git config user.name \"" + username + "\"";
            console.log(cmd);
            const { stdout, stderr } = await exec(cmd, options);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
        {
            let cmd = "git config user.email \"" + email + "\"";
            console.log(cmd);
            const { stdout, stderr } = await exec(cmd, options);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
        {
            let cmd = "git config push.default simple";
            console.log(cmd);
            const { stdout, stderr } = await exec(cmd, options);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
    }

    static async addFiles() {
        let cmd = "git add -A";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async isNew() {
        let cmd = "git rev-parse HEAD &> /dev/null || echo 1";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);

        return !!stdout;
    }

    static async hasChanges() {
        let cmd = "git diff-index --quiet HEAD -- || echo 1";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);

        return !!stdout;
    }

    static async commit(message) {
        let cmd = "git commit -am \"" + message + "\"";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async pull() {
        let cmd = "git pull";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async push() {
        let cmd = "git push";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async listFiles() {
        let cmd = "find " + options.cwd;
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async writeFile(filename, content) {
        await writeFile(options.cwd + "/" + filename, content);
    }
}

module.exports = {
    Git
};
