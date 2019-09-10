import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { McmaProject } from "commons";
import { takeWhile } from "rxjs/operators";
import { LaunchControlData } from "../../@core/data/launch-control";

@Component({
    selector: "mcma-project-detail",
    templateUrl: "./project-detail.component.html",
    styleUrls: ["project-detail.component.scss"],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
    private alive = true;

    project: McmaProject;

    constructor(private launchControlService: LaunchControlData, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        console.log();
        this.launchControlService.getProject(this.route.snapshot.params["projectName"])
            .pipe(takeWhile(() => this.alive))
            .subscribe(project => this.project = project);
    }

    ngOnDestroy(): void {
        this.alive = false;
    }

}
