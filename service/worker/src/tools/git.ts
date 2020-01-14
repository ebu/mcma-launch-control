import { promisify } from "util";
import { exec } from "child_process";
import { writeFile } from "fs";

const execAsync = promisify(exec);
const writeFileAsync = promisify(writeFile);

const GIT = "git";

const options: any = {};

export class Git {
    static setWorkingDir(workingDir) {
        options.cwd = workingDir;
    }

    static async version() {
        let cmd = GIT + " --version";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
        return stdout;
    }

    static async clone(httpsUrl) {
        {
            let cmd = "rm -rf " + options.cwd;
            console.log(cmd);
            const { stdout, stderr } = await execAsync(cmd);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
        {
            let cmd = "git clone " + httpsUrl + " " + options.cwd;
            console.log(cmd);
            const { stdout, stderr } = await execAsync(cmd);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
    }

    static async config(username, email) {
        {
            let cmd = "git config user.name \"" + username + "\"";
            console.log(cmd);
            const { stdout, stderr } = await execAsync(cmd, options);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
        {
            let cmd = "git config user.email \"" + email + "\"";
            console.log(cmd);
            const { stdout, stderr } = await execAsync(cmd, options);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
        {
            let cmd = "git config push.default simple";
            console.log(cmd);
            const { stdout, stderr } = await execAsync(cmd, options);
            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        }
    }

    static async addFiles() {
        let cmd = "git add -A";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async isNew() {
        let cmd = "git rev-parse HEAD &> /dev/null || echo 1";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);

        return !!stdout;
    }

    static async hasChanges() {
        let cmd = "git diff-index --quiet HEAD -- || echo 1";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);

        return !!stdout;
    }

    static async commit(message) {
        let cmd = "git commit -am \"" + message + "\"";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async pull() {
        let cmd = "git pull";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async push() {
        let cmd = "git push";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, options);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async listFiles() {
        let cmd = "find " + options.cwd;
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async writeFile(filename, content) {
        await writeFileAsync(options.cwd + "/" + filename, content);
    }
}
