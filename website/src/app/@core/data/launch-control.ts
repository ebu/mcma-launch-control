import { Observable } from "rxjs";

import { McmaProject } from "commons";

export abstract class LaunchControlData {
    abstract getProjects(): Observable<McmaProject[]>;
}
