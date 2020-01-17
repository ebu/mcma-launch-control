import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

const TERRAFORM = process.env.LAMBDA_TASK_ROOT + "/bin/terraform";

let cwd;

export class Terraform {
    static setWorkingDir(workingDir) {
        cwd = workingDir;
    }

    static async version() {
        let cmd = TERRAFORM + " --version";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd);
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
        return stdout;
    }

    static async init(deploymentName) {
        let cmd = TERRAFORM + " init -backend-config=path=\"deployments/" + deploymentName + "/terraform.tfstate\" -input=false -no-color";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, { cwd });
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async apply() {
        let cmd = TERRAFORM + " apply -auto-approve -input=false -no-color";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, { cwd });
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async destroy() {
        let cmd = TERRAFORM + " destroy -force -input=false -no-color";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, { cwd });
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    }

    static async output() {
        let cmd = TERRAFORM + " output -json -no-color";
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd, { cwd });
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
        return JSON.parse(stdout);
    }
}
