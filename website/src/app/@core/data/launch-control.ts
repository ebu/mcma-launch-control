import { Observable } from "rxjs";

import { McmaProject } from "commons";

export abstract class LaunchControlData {
    abstract getProjects(): Observable<McmaProject[]>;

    abstract getProject(projectName: string): Observable<McmaProject>;

    abstract setProject(project: McmaProject): Observable<McmaProject>;

    abstract deleteProject(projectId: string): Observable<any>;
}
