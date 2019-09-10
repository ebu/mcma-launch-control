import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { McmaDeploymentConfig, McmaProject, McmaComponent, McmaDeployment } from "commons";

import { LaunchControlData } from "../data/launch-control";
import { map, switchMap } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ConfigService } from "../utils";

const httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "application/json",
    }),
};

const castToDeploymentConfig = result => new McmaDeploymentConfig(result);
const castToProject = result => new McmaProject(result);
const castToComponent = result => new McmaComponent(result);
const castToDeployment = result => new McmaDeployment(result);

@Injectable()
export class LaunchControlService extends LaunchControlData {

    constructor(private http: HttpClient, private config: ConfigService) {
        super();
    }

    getDeploymentConfigs(): Observable<McmaDeploymentConfig[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/deployment-configs")),
            map(result => (<any[]>result).map(castToDeploymentConfig)),
        );
    }

    getDeploymentConfig(deploymentConfigName: string): Observable<McmaDeploymentConfig> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/deployment-configs/" + deploymentConfigName)),
            map(castToDeploymentConfig),
        );
    }

    setDeploymentConfig(deploymentConfig: McmaDeploymentConfig): Observable<McmaDeploymentConfig> {
        if (!deploymentConfig.id) {
            return this.config.get<string>("service_url").pipe(
                switchMap(serviceUrl => this.http.post(serviceUrl + "/deployment-configs", deploymentConfig, httpOptions)),
                map(castToDeploymentConfig),
            );
        } else {
            return this.http.put(deploymentConfig.id, deploymentConfig, httpOptions).pipe(
                map(castToDeploymentConfig),
            );
        }
    }

    deleteDeploymentConfig(deploymentConfigName: string): Observable<any> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.delete(serviceUrl + "/deployment-configs/" + deploymentConfigName)),
        );
    }

    getProjects(): Observable<McmaProject[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects")),
            map(result => (<any[]>result).map(castToProject)),
        );
    }

    getProject(projectName: string): Observable<McmaProject> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName)),
            map(castToProject),
        );
    }

    setProject(project: McmaProject): Observable<McmaProject> {
        if (!project.id) {
            return this.config.get<string>("service_url").pipe(
                switchMap(serviceUrl => this.http.post(serviceUrl + "/projects", project, httpOptions)),
                map(castToProject),
            );
        } else {
            return this.http.put(project.id, project, httpOptions).pipe(
                map(castToProject),
            );
        }
    }

    deleteProject(projectName: string): Observable<any> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.delete(serviceUrl + "/projects/" + projectName)),
        );
    }

    getComponents(projectName: string): Observable<McmaComponent[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName + "/components")),
            map(result => (<any[]>result).map(castToComponent)),
        );
    }

    getComponent(projectName: string, componentName: string): Observable<McmaComponent> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName + "/components/" + componentName)),
            map(castToComponent),
        );
    }

    setComponent(projectName: string, component: McmaComponent): Observable<McmaComponent> {
        if (!component.id) {
            return this.config.get<string>("service_url").pipe(
                switchMap(serviceUrl => this.http.post(serviceUrl + "/projects/" + projectName + "/components", component, httpOptions)),
                map(castToComponent),
            );
        } else {
            return this.http.put(component.id, component, httpOptions).pipe(
                map(castToComponent),
            );
        }
    }

    deleteComponent(projectName: string, componentName: string): Observable<any> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.delete(serviceUrl + "/projects/" + projectName + "/components/" + componentName)),
        );
    }

    getDeployments(projectName: string): Observable<McmaDeployment[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName + "/deployments")),
            map(result => (<any[]>result).map(castToDeployment)),
        );
    }

    getDeployment(projectName: string, deploymentName: string): Observable<McmaDeployment> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName + "/deployments/" + deploymentName)),
            map(castToDeployment),
        );
    }

    updateDeployment(projectName: string, deploymentName: string): Observable<McmaDeployment> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.post(serviceUrl + "/projects/" + projectName + "/deployments/" + deploymentName, undefined, httpOptions)),
            map(castToDeployment),
        );
    }

    deleteDeployment(projectName: string, deploymentName: string): Observable<any> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.delete(serviceUrl + "/projects/" + projectName + "/components/" + deploymentName)),
        );
    }
}
