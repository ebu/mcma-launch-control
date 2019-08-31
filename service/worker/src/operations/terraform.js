const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { Logger } = require("@mcma/core");

const TERRAFORM = process.env.LAMBDA_TASK_ROOT + "/bin/terraform";

class Terraform {
    constructor (workingDir) {
        this.workingDir = workingDir;
    }

    static async version() {
        let cmd = TERRAFORM + " --version";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
        return stdout;
    }

    async init() {
        let cmd = TERRAFORM + " init";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, { cwd: this.workingDir});
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
    }
}

module.exports = {
    Terraform
};