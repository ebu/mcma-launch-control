const { DynamoDbTable } = require("@mcma/aws-dynamodb");
const { McmaProject, McmaDeploymentConfig, McmaDeployment, McmaComponent } = require("commons");

class DataController {
    constructor(tableName) {
        this.tableName = tableName;
        this.projectTable = new DynamoDbTable(this.tableName, McmaProject);
        this.deploymentConfigTable = new DynamoDbTable(this.tableName, McmaDeploymentConfig);
        this.deploymentTable = new DynamoDbTable(this.tableName, McmaDeployment);
        this.componentTable = new DynamoDbTable(this.tableName, McmaComponent);
    }

    async getProject(projectId) {
        let project;
        try {
            project = await this.projectTable.get(projectId);
        } catch (ignored) {
        }

        if (!project) {
            return null;
        }
        return new McmaProject(project);
    }

    async setProject(project) {
        if (typeof project.id !== "string") {
            throw new Error("McmaProject missing id");
        }

        project = await this.projectTable.put(project.id, project);
        return new McmaProject(project);
    }

    async deleteProject(projectId) {
        let project = await this.getProject(projectId);
        if (!project) {
            return false;
        }
        await this.projectTable.delete(projectId);
        return true;
    }

    async getDeploymentConfig(deploymentConfigId) {
        let deploymentConfig;
        try {
            deploymentConfig = await this.deploymentConfigTable.get(deploymentConfigId);
        } catch (ignored) {
        }

        if (!deploymentConfig) {
            return null;
        }
        return new McmaDeploymentConfig(deploymentConfig);
    }

    async setDeploymentConfig(deploymentConfig) {
        if (typeof deploymentConfig.id !== "string") {
            throw new Error("McmaDeploymentConfig missing id");
        }

        deploymentConfig = await this.deploymentConfigTable.put(deploymentConfig.id, deploymentConfig);
        return new McmaDeploymentConfig(deploymentConfig);
    }

    async deleteDeploymentConfig(deploymentConfigId) {
        let deploymentConfig = await this.getDeploymentConfig(deploymentConfigId);
        if (!deploymentConfig) {
            return false;
        }
        await this.deploymentConfigTable.delete(deploymentConfigId);
        return true;
    }

    async getDeployment(deploymentId) {
        let deployment;
        try {
            deployment = await this.deploymentTable.get(deploymentId);
        } catch (ignored) {
        }

        if (!deployment) {
            return null;
        }
        return new McmaDeployment(deployment);
    }

    async setDeployment(deployment) {
        if (typeof deployment.id !== "string") {
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

    async getComponents(projectId) {
        let resources = await this.componentTable.query((resource) => resource.id.startsWith(projectId));
        resources.map(value => new McmaComponent(value));
        return resources;
    }

    async getComponent(componentId) {
        let component;
        try {
            component = await this.componentTable.get(componentId);
        } catch (ignored) {
        }

        if (!component) {
            return null;
        }
        return new McmaComponent(component);
    }

    async setComponent(component) {
        if (typeof component.id !== "string") {
            throw new Error("McmaComponent missing id");
        }

        component = await this.componentTable.put(component.id, component);
        return new McmaComponent(component);
    }

    async deleteComponent(componentId) {
        let component = await this.getComponent(componentId);
        if (!component) {
            return false;
        }
        await this.componentTable.delete(componentId);
        return true;
    }
}

module.exports = {
    DataController
};
