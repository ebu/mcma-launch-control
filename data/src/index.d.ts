import { McmaProject, McmaDeploymentConfig, McmaDeployment } from "commons";

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
}
