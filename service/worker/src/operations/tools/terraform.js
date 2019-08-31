const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { Logger } = require("@mcma/core");

const TERRAFORM = process.env.LAMBDA_TASK_ROOT + "/bin/terraform";

let cwd;

class Terraform {
    static setWorkingDir(workingDir) {
        cwd = workingDir;
    }

    static async version() {
        let cmd = TERRAFORM + " --version";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd);
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
        return stdout;
    }

    static async init(deploymentName) {
        let cmd = TERRAFORM + " init -backend-config=path=\"deployments/" + deploymentName + "/terraform.tfstate\" -input=false -no-color";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, { cwd });
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
    }

    static async apply() {
        let cmd = TERRAFORM + " apply -auto-approve -input=false -no-color";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, { cwd });
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
    }

    static async destroy() {
        let cmd = TERRAFORM + " destroy -force -input=false -no-color";
        Logger.info(cmd);
        const { stdout, stderr } = await exec(cmd, { cwd });
        Logger.info("stdout:", stdout);
        Logger.info("stderr:", stderr);
    }
}

module.exports = {
    Terraform
};