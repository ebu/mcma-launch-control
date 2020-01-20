const { DynamoDbTable } = require("@mcma/aws-dynamodb");
const { McmaProject, McmaDeploymentConfig, McmaDeployment, McmaComponent, McmaDeployedComponent } = require("@local/commons");

class DataController {
    constructor(tableName) {
        this.tableName = tableName;
        this.projectTable = new DynamoDbTable(this.tableName, McmaProject);
        this.deploymentConfigTable = new DynamoDbTable(this.tableName, McmaDeploymentConfig);
        this.deploymentTable = new DynamoDbTable(this.tableName, McmaDeployment);
        this.componentTable = new DynamoDbTable(this.tableName, McmaComponent);
        this.deployedComponentTable = new DynamoDbTable(this.tableName, McmaDeployedComponent)
    }

    async getProjects() {
        let resources = await this.projectTable.query();
        return resources.map(value => new McmaComponent(value));
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

    async getDeploymentConfigs() {
        let resources = await this.deploymentConfigTable.query();
        return resources.map(value => new McmaComponent(value));
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

    async getDeployments(projectId) {
        let resources = await this.deploymentTable.query((resource) => resource.id.startsWith(projectId + "/"));
        return resources.map(value => new McmaComponent(value));
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
        let resources = await this.componentTable.query((resource) => resource.id.startsWith(projectId + "/"));
        return resources.map(value => new McmaComponent(value));
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

    async getDeployedComponents(deploymentId) {
        let resources = await this.deployedComponentTable.query((resource) => resource.id.startsWith(deploymentId + "/"));
        return resources.map(value => new McmaDeployedComponent(value));
    }

    async getDeployedComponent(deployedComponentId) {
        let deployedComponent;
        try {
            deployedComponent = await this.deployedComponentTable.get(deployedComponentId);
        } catch (ignored) {
        }

        if (!deployedComponent) {
            return null;
        }
        return new McmaDeployedComponent(deployedComponent);
    }

    async setDeployedComponent(deployedComponent) {
        if (typeof deployedComponent.id !== "string") {
            throw new Error("McmaDeployedComponent missing id");
        }

        deployedComponent = await this.deployedComponentTable.put(deployedComponent.id, deployedComponent);
        return new McmaDeployedComponent(deployedComponent);
    }

    async deleteDeployedComponent(deployedComponentId) {
        let deployedComponent = await this.getDeployedComponent(deployedComponentId);
        if (!deployedComponent) {
            return false;
        }
        await this.deployedComponentTable.delete(deployedComponentId);
        return true;
    }
}

module.exports = {
    DataController
};
