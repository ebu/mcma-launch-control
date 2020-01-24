import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { McmaComponent, McmaDeployment, McmaDeploymentConfig, McmaProject, McmaDeployedComponent } from "@local/commons";

import { LaunchControlData } from "../data/launch-control";
import { map, switchMap, take } from "rxjs/operators";
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
const castToDeployedComponent = result => new McmaDeployedComponent(result);

@Injectable()
export class LaunchControlService extends LaunchControlData {

    constructor(private http: HttpClient, private config: ConfigService) {
        super();
    }

    getDeploymentConfigs(): Observable<McmaDeploymentConfig[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/deployment-configs")),
            map(result => (<any[]>result).map(castToDeploymentConfig)),
            take(1),
        );
    }

    getDeploymentConfig(deploymentConfigName: string): Observable<McmaDeploymentConfig> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/deployment-configs/" + deploymentConfigName)),
            map(castToDeploymentConfig),
            take(1),
        );
    }

    setDeploymentConfig(deploymentConfig: McmaDeploymentConfig): Observable<McmaDeploymentConfig> {
        if (!deploymentConfig.id) {
            return this.config.get<string>("service_url").pipe(
                switchMap(serviceUrl => this.http.post(serviceUrl + "/deployment-configs", deploymentConfig, httpOptions)),
                map(castToDeploymentConfig),
                take(1),
            );
        } else {
            return this.http.put(deploymentConfig.id, deploymentConfig, httpOptions).pipe(
                map(castToDeploymentConfig),
                take(1),
            );
        }
    }

    deleteDeploymentConfig(deploymentConfigName: string): Observable<any> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.delete(serviceUrl + "/deployment-configs/" + deploymentConfigName)),
            take(1),
        );
    }

    getProjects(): Observable<McmaProject[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects")),
            map(result => (<any[]>result).map(castToProject)),
            take(1),
        );
    }

    getProject(projectName: string): Observable<McmaProject> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName)),
            map(castToProject),
            take(1),
        );
    }

    setProject(project: McmaProject): Observable<McmaProject> {
        if (!project.id) {
            return this.config.get<string>("service_url").pipe(
                switchMap(serviceUrl => this.http.post(serviceUrl + "/projects", project, httpOptions)),
                map(castToProject),
                take(1),
            );
        } else {
            return this.http.put(project.id, project, httpOptions).pipe(
                map(castToProject),
                take(1),
            );
        }
    }

    deleteProject(projectName: string): Observable<any> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.delete(serviceUrl + "/projects/" + projectName)),
            take(1),
        );
    }

    getComponents(projectName: string): Observable<McmaComponent[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName + "/components")),
            map(result => (<any[]>result).map(castToComponent)),
            take(1),
        );
    }

    getComponent(projectName: string, componentName: string): Observable<McmaComponent> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName + "/components/" + componentName)),
            map(castToComponent),
            take(1),
        );
    }

    setComponent(projectName: string, component: McmaComponent): Observable<McmaComponent> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.put(serviceUrl + "/projects/" + projectName + "/components/" + component.name, component, httpOptions)),
            map(castToComponent),
            take(1),
        );
    }

    deleteComponent(projectName: string, componentName: string): Observable<any> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.delete(serviceUrl + "/projects/" + projectName + "/components/" + componentName)),
            take(1),
        );
    }

    getDeployments(projectName: string): Observable<McmaDeployment[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName + "/deployments")),
            map(result => (<any[]>result).map(castToDeployment)),
            take(1),
        );
    }

    getDeployment(projectName: string, deploymentName: string): Observable<McmaDeployment> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName + "/deployments/" + deploymentName)),
            map(castToDeployment),
            take(1),
        );
    }

    updateDeployment(projectName: string, deploymentName: string): Observable<McmaDeployment> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.post(serviceUrl + "/projects/" + projectName + "/deployments/" + deploymentName, undefined, httpOptions)),
            map(castToDeployment),
            take(1),
        );
    }

    deleteDeployment(projectName: string, deploymentName: string): Observable<any> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.delete(serviceUrl + "/projects/" + projectName + "/deployments/" + deploymentName)),
            take(1),
        );
    }

    getDeployedComponents(projectName: string, deploymentName: string): Observable<McmaDeployedComponent[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects/" + projectName + "/deployments/" + deploymentName + "/components")),
            map(result => (<any[]>result).map(castToDeployedComponent)),
            take(1),
        );
    }
}
