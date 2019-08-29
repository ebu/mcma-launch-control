import { McmaProject, McmaDeployment } from "commons";

export class DataController {
    constructor(tableName: string);

    getProject(projectId: string): Promise<McmaProject>;

    getDeployment(deploymentId: string): Promise<McmaDeployment>;
    setDeployment(deployment: McmaDeployment): Promise<McmaDeployment>;
    deleteDeployment(deploymentId: string): Promise<boolean>;
}
