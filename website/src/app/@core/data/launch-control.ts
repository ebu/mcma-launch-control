import { Observable } from "rxjs";

import { McmaDeploymentConfig, McmaProject, McmaComponent, McmaDeployment } from "@local/commons";

export abstract class LaunchControlData {
    abstract getDeploymentConfigs(): Observable<McmaDeploymentConfig[]>;

    abstract getDeploymentConfig(deploymentConfigName: string): Observable<McmaDeploymentConfig>;

    abstract setDeploymentConfig(deploymentConfig: McmaDeploymentConfig): Observable<McmaDeploymentConfig>;

    abstract deleteDeploymentConfig(deploymentConfigName: string): Observable<any>;

    abstract getProjects(): Observable<McmaProject[]>;

    abstract getProject(projectName: string): Observable<McmaProject>;

    abstract setProject(project: McmaProject): Observable<McmaProject>;

    abstract deleteProject(projectName: string): Observable<any>;

    abstract getComponents(projectName: string): Observable<McmaComponent[]>;

    abstract getComponent(projectName: string, componentName: string): Observable<McmaComponent>;

    abstract setComponent(projectName: string, component: McmaComponent): Observable<McmaComponent>;

    abstract deleteComponent(projectName: string, componentName: string): Observable<any>;

    abstract getDeployments(projectName: string): Observable<McmaDeployment[]>;

    abstract getDeployment(projectName: string, deploymentName: string): Observable<McmaDeployment>;

    abstract updateDeployment(projectName: string, deploymentName: string): Observable<McmaDeployment>;

    abstract deleteDeployment(projectName: string, deploymentName: string): Observable<any>;
}
