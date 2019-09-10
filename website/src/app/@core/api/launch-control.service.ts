import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { McmaProject } from "commons";

import { LaunchControlData } from "../data/launch-control";
import { map, switchMap } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ConfigService } from "../utils";

const httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "application/json",
    }),
};

const castToProject = result => new McmaProject(result);

@Injectable()
export class LaunchControlService extends LaunchControlData {

    constructor(private http: HttpClient, private config: ConfigService) {
        super();
    }

    getProjects(): Observable<McmaProject[]> {
        return this.config.get<string>("service_url").pipe(
            switchMap(serviceUrl => this.http.get(serviceUrl + "/projects")),
            map(result => (<McmaProject[]>result).map(castToProject)),
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

    deleteProject(projectId: string): Observable<any> {
        return this.http.delete(projectId);
    }
}
