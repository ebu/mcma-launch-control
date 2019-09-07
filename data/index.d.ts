import { McmaProject, McmaDeploymentConfig, McmaDeployment, McmaComponent } from "commons";

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

    getComponents(projectId: string): Promise<Array<McmaComponent>>
    getComponent(componentId: string): Promise<McmaComponent>;
    setComponent(component: McmaComponent): Promise<McmaComponent>;
    deleteComponent(componentId: string): Promise<boolean>;
}
