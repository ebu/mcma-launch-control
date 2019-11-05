const util = require('util');
const exec = util.promisify(require('child_process').exec);

const TERRAFORM = process.env.LAMBDA_TASK_ROOT + "/bin/terraform";

let cwd;

class Terraform {
    static setWorkingDir(workingDir) {
        cwd = workingDir;
    }

    static async version() {
        let cmd = TERRAFORM + " --version";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
        return stdout;
    }

    static async init(deploymentName) {
        let cmd = TERRAFORM + " init -backend-config=path=\"deployments/" + deploymentName + "/terraform.tfstate\" -input=false -no-color";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd, { cwd });
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async apply() {
        let cmd = TERRAFORM + " apply -auto-approve -input=false -no-color";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd, { cwd });
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async destroy() {
        let cmd = TERRAFORM + " destroy -force -input=false -no-color";
        console.log(cmd);
        const { stdout, stderr } = await exec(cmd, { cwd });
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }
}

module.exports = {
    Terraform
};
