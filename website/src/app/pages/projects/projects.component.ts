import { Component, OnDestroy } from "@angular/core";
import { LaunchControlData } from "../../@core/data/launch-control";
import { takeWhile } from "rxjs/operators";

import { LocalDataSource } from "ng2-smart-table";

@Component({
    selector: "mcma-projects",
    templateUrl: "./projects.component.html",
    styleUrls: ["projects.component.scss"],
})
export class ProjectsComponent implements OnDestroy {
    private alive = true;

    settings = {
        add: {
            addButtonContent: "<i class=\"nb-plus\"></i>",
            createButtonContent: "<i class=\"nb-checkmark\"></i>",
            cancelButtonContent: "<i class=\"nb-close\"></i>",
        },
        edit: {
            editButtonContent: "<i class=\"nb-edit\"></i>",
            saveButtonContent: "<i class=\"nb-checkmark\"></i>",
            cancelButtonContent: "<i class=\"nb-close\"></i>",
        },
        delete: {
            deleteButtonContent: "<i class=\"nb-trash\"></i>",
        },

        mode: "external",
        hideSubHeader: true,

        actions: {
            position: "right",
        },

        filter: false,

        columns: {
            name: {
                title: "Name",
                type: "string",
            },
            displayName: {
                title: "Display Name",
                type: "string",
                width: "75%",
            },
        },
    };

    source: LocalDataSource = new LocalDataSource();

    constructor(private launchControlService: LaunchControlData) {
        this.launchControlService.getProjects()
            .pipe(takeWhile(() => this.alive))
            .subscribe(projects => this.source.load(projects));
    }

    ngOnDestroy(): void {
        this.alive = false;
    }

    onCreate(event): void {
        console.log(event);
    }

    onEdit(event): void {
        console.log(event);
    }

    onDeleteConfirm(event): void {
        if (window.confirm("Are you sure you want to delete?")) {
            event.confirm.resolve();
        } else {
            event.confirm.reject();
        }
    }

    onDelete(event): void {
        console.log(event);
    }
}
