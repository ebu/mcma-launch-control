import { Component, OnDestroy, OnInit } from "@angular/core";
import { LaunchControlData } from "../../@core/data/launch-control";
import { map, switchMap, takeWhile } from "rxjs/operators";

import { LocalDataSource } from "ng2-smart-table";
import { NbDialogService } from "@nebular/theme";
import { AddDeploymentConfigDialogComponent } from "./dialogs/add-deployment-config-dialog.component";

import { McmaDeploymentConfig } from "commons";
import { DeleteDeploymentConfigDialogComponent } from "./dialogs/delete-deployment-config-dialog.component";

@Component({
    selector: "mcma-deploymentConfigs",
    templateUrl: "./deployment-configs.component.html",
    styleUrls: ["deployment-configs.component.scss"],
})
export class DeploymentConfigsComponent implements OnInit, OnDestroy {
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
            edit: false,
            position: "right",
        },

        filter: false,

        columns: {
            name: {
                title: "Code",
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

    constructor(private launchControlService: LaunchControlData, private dialogService: NbDialogService) {
    }

    ngOnInit(): void {
        this.launchControlService.getDeploymentConfigs()
            .pipe(takeWhile(() => this.alive))
            .subscribe(deploymentConfigs => this.source.load(deploymentConfigs));
    }

    ngOnDestroy(): void {
        this.alive = false;
    }

    onCreate(): void {
        this.dialogService.open(AddDeploymentConfigDialogComponent).onClose.pipe(
            takeWhile(deploymentConfigDetails => !!deploymentConfigDetails),
            map(deploymentConfigDetails => new McmaDeploymentConfig(deploymentConfigDetails)),
            switchMap(deploymentConfig => this.launchControlService.setDeploymentConfig(deploymentConfig)),
            switchMap(() => this.launchControlService.getDeploymentConfigs()),
            takeWhile(() => this.alive),
        ).subscribe(deploymentConfigs => this.source.load(deploymentConfigs));
    }

    onDelete(event): void {
        this.dialogService.open(DeleteDeploymentConfigDialogComponent, {
            context: {
                code: event.data.name,
                displayName: event.data.displayName,
            },
        }).onClose.pipe(
            takeWhile(deploymentConfigName => deploymentConfigName === event.data.name),
            switchMap(() => this.launchControlService.deleteDeploymentConfig(event.data.name)),
            switchMap(() => this.launchControlService.getDeploymentConfigs()),
            takeWhile(() => this.alive),
        ).subscribe(deploymentConfigs => this.source.load(deploymentConfigs));
    }
}
