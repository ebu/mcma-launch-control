import { Injectable } from "@angular/core";
import { Observable, of as observableOf } from "rxjs";

import { McmaProject } from "commons";

import { LaunchControlData } from "../data/launch-control";

const projects: McmaProject[] = [
    new McmaProject({ name: "ingest-wf", displayName: "Ingest Workflow" }),
    new McmaProject({ name: "media-repo", displayName: "Media Repository" }),
];

@Injectable()
export class LaunchControlService extends LaunchControlData {
    getProjects(): Observable<McmaProject[]> {
        return observableOf(projects);
    }
}
