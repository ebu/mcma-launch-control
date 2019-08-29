const { DynamoDbTable } = require("@mcma/aws-dynamodb");
const { McmaProject, McmaDeployment } = require("commons");

class DataController {
    constructor(tableName) {
        this.tableName = tableName;
        this.projectTable = new DynamoDbTable(McmaProject, this.tableName);
        this.deploymentTable = new DynamoDbTable(McmaDeployment, this.tableName);
    }

    async getProject(projectId) {
        let project = await this.projectTable.get(projectId);
        if (!project) {
            return null;
        }
        return new McmaProject(project);
    }

    async getDeployment(deploymentId) {
        let deployment = await this.deploymentTable.get(deploymentId);
        if (!deployment) {
            return null;
        }
        return new McmaDeployment(deployment);
    }

    async setDeployment(deployment) {
        if (!(typeof deployment.id === "string")) {
            throw new Error("McmaDeployment missing id");
        }

        deployment = await this.deploymentTable.put(deployment.id, deployment);
        return new McmaDeployment(deployment);
    }

    async deleteDeployment(deploymentId) {
        let deployment = await this.getDeployment(deploymentId);
        if (!deployment) {
            return false;
        }
        await this.deploymentTable.delete(deploymentId);
        return true;
    }
}

module.exports = {
    DataController
};