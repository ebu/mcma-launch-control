import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { McmaDeploymentConfig } from "@local/commons";
import { map, switchMap, takeWhile } from "rxjs/operators";
import { LaunchControlData } from "../../@core/data/launch-control";
import { LocalDataSource } from "ng2-smart-table";
import { NbDialogService } from "@nebular/theme";
import { DeleteVariableDialogComponent } from "./dialogs/delete-variable-dialog.component";
import { EditVariableDialogComponent } from "./dialogs/edit-variable-dialog.component";

@Component({
    selector: "mcma-deployment-config-detail",
    templateUrl: "./deployment-config-detail.component.html",
    styleUrls: ["deployment-config-detail.component.scss"],
})
export class DeploymentConfigDetailComponent implements OnInit, OnDestroy {
    private alive = true;

    deploymentConfig: McmaDeploymentConfig;

    variableSettings = {
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
                title: "Name",
                type: "string",
                width: "20%",
            },
            value: {
                title: "Value",
                type: "string",
                width: "70%",
            },
        },
    };

    variableSource: LocalDataSource = new LocalDataSource();

    constructor(private launchControlService: LaunchControlData, private route: ActivatedRoute, private dialogService: NbDialogService) {
    }

    ngOnInit() {
        this.launchControlService.getDeploymentConfig(this.route.snapshot.params["deploymentConfigName"])
            .pipe(takeWhile(() => this.alive))
            .subscribe(deploymentConfig => this.loadDeploymentConfig(deploymentConfig));
    }

    ngOnDestroy() {
        this.alive = false;
    }

    private loadDeploymentConfig(deploymentConfig: McmaDeploymentConfig) {
        this.deploymentConfig = deploymentConfig;

        this.loadVariables();
    }

    private loadVariables() {
        const variables = [];
        for (const name of Object.keys(this.deploymentConfig.variables)) {
            variables.push({
                name,
                value: this.deploymentConfig.variables[name],
            });
        }
        variables.sort((a, b) => a.name.localeCompare(b.name));
        this.variableSource.load(variables);
    }

    onAddVariable() {
        this.dialogService.open(EditVariableDialogComponent, {
            context: {
                variable: { name: "", value: "" },
            },
        }).onClose.pipe(
            takeWhile(variable => !!variable),
            map(variable => {
                this.deploymentConfig.variables[variable.name] = variable.value;
                return this.deploymentConfig;
            }),
            switchMap(deploymentConfig => this.launchControlService.setDeploymentConfig(deploymentConfig)),
        ).subscribe(() => this.loadVariables());
    }

    onEditVariable(event) {
        this.dialogService.open(EditVariableDialogComponent, {
            context: {
                variable: event.data,
            },
        }).onClose.pipe(
            takeWhile(variable => !!variable),
            map(variable => {
                if (variable.name !== event.data.name) {
                    delete this.deploymentConfig.variables[event.data.name];
                }
                this.deploymentConfig.variables[variable.name] = variable.value;
                return this.deploymentConfig;
            }),
            switchMap(deploymentConfig => this.launchControlService.setDeploymentConfig(deploymentConfig)),
        ).subscribe(() => this.loadVariables());
    }

    onDeleteVariable(event) {
        this.dialogService.open(DeleteVariableDialogComponent, {
            context: {
                variable: event.data,
            },
        }).onClose.pipe(
            takeWhile(doDelete => doDelete),
            map(ignored => {
                delete this.deploymentConfig.variables[event.data.name];
                return this.deploymentConfig;
            }),
            switchMap(deploymentConfig => this.launchControlService.setDeploymentConfig(deploymentConfig)),
        ).subscribe(() => this.loadVariables());
    }
}
