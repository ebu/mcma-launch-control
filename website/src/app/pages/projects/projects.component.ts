import { Component } from "@angular/core";

@Component({
    selector: "mcma-projects",
    templateUrl: "./projects.component.html",
    styleUrls: ["projects.component.scss"],
})
export class ProjectsComponent {
    projects: string[] = [
        "Ingest Workflow",
        "Media Repository",
    ];
}
