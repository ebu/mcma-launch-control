import { Component, OnDestroy, OnInit } from "@angular/core";
import { LaunchControlData } from "../../@core/data/launch-control";
import { map, switchMap, takeWhile } from "rxjs/operators";

import { LocalDataSource } from "ng2-smart-table";
import { NbDialogService } from "@nebular/theme";
import { AddProjectDialogComponent } from "./dialogs/add-project-dialog.component";

import { McmaProject } from "commons";
import { DeleteProjectDialogComponent } from "./dialogs/delete-project-dialog.component";
import { Router } from "@angular/router";

@Component({
    selector: "mcma-projects",
    templateUrl: "./projects.component.html",
    styleUrls: ["projects.component.scss"],
})
export class ProjectsComponent implements OnInit, OnDestroy {
    private alive = true;

    settings = {
        add: {
            addButtonContent: "<i class=\"nb-plus\"></i>",
            createButtonContent: "<i class=\"nb-checkmark\"></i>",
            cancelButtonContent: "<i class=\"nb-close\"></i>",
        },
        edit: {
            editButtonContent: "<i class=\"nb-edit\" title=\"Edit\"></i>",
            saveButtonContent: "<i class=\"nb-checkmark\"></i>",
            cancelButtonContent: "<i class=\"nb-close\"></i>",
        },
        delete: {
            deleteButtonContent: "<i class=\"nb-trash\" title=\"Delete\"></i>",
        },

        mode: "external",
        hideSubHeader: true,

        actions: {
            position: "right",
        },

        filter: false,

        columns: {
            name: {
                title: "Code",
                type: "string",
                width: "15%",
            },
            displayName: {
                title: "Display Name",
                type: "string",
                width: "75%",
            },
        },
    };

    source: LocalDataSource = new LocalDataSource();

    constructor(private launchControlService: LaunchControlData, private dialogService: NbDialogService, private router: Router) {
    }

    ngOnInit(): void {
        this.launchControlService.getProjects()
            .pipe(takeWhile(() => this.alive))
            .subscribe(projects => this.source.load(projects));
    }

    ngOnDestroy(): void {
        this.alive = false;
    }

    onCreate(): void {
        this.dialogService.open(AddProjectDialogComponent).onClose.pipe(
            takeWhile(projectDetails => !!projectDetails),
            map(projectDetails => new McmaProject(projectDetails)),
            switchMap(project => this.launchControlService.setProject(project)),
            switchMap(() => this.launchControlService.getProjects()),
            takeWhile(() => this.alive),
        ).subscribe(projects => this.source.load(projects));
    }

    onEdit(event): void {
        this.router.navigate(["pages/projects", event.data.name]);
    }

    onDelete(event): void {
        this.dialogService.open(DeleteProjectDialogComponent, {
            context: {
                projectCode: event.data.name,
                projectDisplayName: event.data.displayName,
            },
        }).onClose.pipe(
            takeWhile(projectName => projectName === event.data.name),
            switchMap(() => this.launchControlService.deleteProject(event.data.name)),
            switchMap(() => this.launchControlService.getProjects()),
            takeWhile(() => this.alive),
        ).subscribe(projects => this.source.load(projects));
    }
}
