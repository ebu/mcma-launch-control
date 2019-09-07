import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { McmaProject } from "commons";

import { LaunchControlData } from "../data/launch-control";
import { map, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../utils";

// const httpOptions = {
//     headers: new HttpHeaders({
//         "Content-Type": "application/json",
//     }),
// };

@Injectable()
export class LaunchControlService extends LaunchControlData {

    constructor(private http: HttpClient, private config: ConfigService) {
        super();
    }


    getProjects(): Observable<McmaProject[]> {
        return this.config.get<string>("service_url").pipe(
            map(serviceUrl => serviceUrl + "/projects"),
            switchMap(projectsUrl => this.http.get(projectsUrl)),
            map(result => {
                const projects: McmaProject[] = [];

                if (result instanceof Array) {
                    for (const item of result) {
                        projects.push(new McmaProject(item));
                    }
                }

                return projects;
            }),
        );

    }
}
