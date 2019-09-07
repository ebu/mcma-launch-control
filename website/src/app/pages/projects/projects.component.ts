import { Component, OnDestroy } from "@angular/core";
import { LaunchControlData } from "../../@core/data/launch-control";
import { takeWhile } from "rxjs/operators";

import { McmaProject } from "commons";

@Component({
    selector: "mcma-projects",
    templateUrl: "./projects.component.html",
    styleUrls: ["projects.component.scss"],
})
export class ProjectsComponent implements OnDestroy {
    private alive = true;

    projects: McmaProject[] = [];

    constructor(private launchControlService: LaunchControlData) {
        launchControlService.getProjects()
            .pipe(takeWhile(() => this.alive))
            .subscribe(projects => this.projects = projects);
    }

    ngOnDestroy(): void {
        this.alive = false;
    }
}
