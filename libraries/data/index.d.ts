import { McmaProject, McmaDeploymentConfig, McmaDeployment, McmaComponent, McmaDeployedComponent } from "@local/commons";

export class DataController {
    constructor(tableName: string);

    getProject(projectId: string): Promise<McmaProject>;
    setProject(project: McmaProject): Promise<McmaProject>;
    deleteProject(projectId: string): Promise<boolean>;

    getDeploymentConfig(deploymentConfigId: string): Promise<McmaDeploymentConfig>;
    setDeploymentConfig(deploymentConfig: McmaDeploymentConfig): Promise<McmaDeploymentConfig>;
    deleteDeploymentConfig(deploymentConfigId: string): Promise<boolean>;

    getDeployment(deploymentId: string): Promise<McmaDeployment>;
    setDeployment(deployment: McmaDeployment): Promise<McmaDeployment>;
    deleteDeployment(deploymentId: string): Promise<boolean>;

    getComponents(projectId: string): Promise<McmaComponent[]>
    getComponent(componentId: string): Promise<McmaComponent>;
    setComponent(component: McmaComponent): Promise<McmaComponent>;
    deleteComponent(componentId: string): Promise<boolean>;

    getDeployedComponents(deploymentId: string): Promise<McmaDeployedComponent[]>;
    getDeployedComponent(deployedComponentId: string): Promise<McmaDeployedComponent>;
    setDeployedComponent(deployedComponent: McmaDeployedComponent): Promise<McmaDeployedComponent>;
    deleteDeployedComponent(deployedComponentId: string): Promise<boolean>;
}
