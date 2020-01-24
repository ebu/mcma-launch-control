import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { McmaDeployedComponent, McmaDeployment, McmaDeploymentConfig, McmaProject, McmaProvider, McmaVariable } from "@local/commons";
import { takeWhile } from "rxjs/operators";
import { LaunchControlData } from "../../@core/data/launch-control";
import { LocalDataSource } from "ng2-smart-table";
import { NbDialogService } from "@nebular/theme";
import { forkJoin } from "rxjs";
import { ViewDeployedComponentDialogComponent } from "./dialogs/view-deployed-component-dialog.component";
import { ViewProviderDialogComponent } from "./dialogs/view-provider-dialog.component";

@Component({
    selector: "mcma-deployment-detail",
    templateUrl: "./deployment-detail.component.html",
    styleUrls: ["deployment-detail.component.scss"],
})
export class DeploymentDetailComponent implements OnInit, OnDestroy {
    private alive = true;

    project: McmaProject;
    deploymentConfig: McmaDeploymentConfig;
    deployment: McmaDeployment;
    deployedComponents: McmaDeployedComponent[];

    variableSettings = {
        add: null,
        edit: null,
        delete: null,

        mode: "external",
        hideSubHeader: true,

        actions: {
            position: "none",
            add: false,
            edit: false,
            delete: false,
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
                width: "80%",
            },
        },
    };

    variableSource: LocalDataSource = new LocalDataSource();

    providerSettings = {
        add: null,
        edit: null,
        delete: null,

        mode: "external",
        hideSubHeader: true,

        actions: {
            position: "right",
            columnTitle: "",
            add: false,
            edit: false,
            delete: false,
            custom: [
                {
                    name: "view",
                    title: "<i class=\"nb-search\" title=\"View\"></i>",
                },
            ],
        },

        filter: false,

        columns: {
            name: {
                title: "Code",
                type: "string",
                width: "20%",
            },
            displayName: {
                title: "Display Name",
                type: "string",
                width: "80%",
            },
        },
    };

    providerSource: LocalDataSource = new LocalDataSource();

    componentSettings = {
        mode: "external",
        hideSubHeader: true,

        actions: {
            position: "right",
            columnTitle: "",
            add: false,
            edit: false,
            delete: false,
            custom: [
                {
                    name: "view",
                    title: "<i class=\"nb-search\" title=\"View\"></i>",
                },
            ],
        },

        filter: false,

        columns: {
            name: {
                title: "Code",
                type: "string",
                width: "20%",
            },
            displayName: {
                title: "Display Name",
                type: "string",
                width: "80%",
            },
        },
    };

    componentSource: LocalDataSource = new LocalDataSource();

    constructor(private launchControlService: LaunchControlData, private route: ActivatedRoute, private dialogService: NbDialogService) {
    }

    ngOnInit() {
        forkJoin({
            project: this.launchControlService.getProject(this.route.snapshot.params["projectName"]),
            deploymentConfig: this.launchControlService.getDeploymentConfig(this.route.snapshot.params["deploymentName"]),
            deployment: this.launchControlService.getDeployment(this.route.snapshot.params["projectName"], this.route.snapshot.params["deploymentName"]),
            deployedComponents: this.launchControlService.getDeployedComponents(this.route.snapshot.params["projectName"], this.route.snapshot.params["deploymentName"]),
        })
            .pipe(takeWhile(() => this.alive))
            .subscribe(results => {
                this.project = results.project;
                this.deploymentConfig = results.deploymentConfig;
                this.deployment = results.deployment;
                this.deployedComponents = results.deployedComponents;

                this.loadVariables();
                this.loadProviders();
                this.loadComponents();
            });
    }

    ngOnDestroy() {
        this.alive = false;
    }

    private loadVariables() {
        const variables = [];
        for (const variable of this.deployment.variables) {
            const copy = new McmaVariable(variable);
            if (copy.secure) {
                copy.value = "••••••••••••••••";
            }
            variables.push(copy);
        }

        this.variableSource.load(variables);
    }

    private loadProviders() {
        this.providerSource.load(this.deployment.providers);
    }

    private loadComponents() {
        this.componentSource.load(this.deployedComponents);
    }

    onViewProvider(event) {
        this.dialogService.open(ViewProviderDialogComponent, {
            context: {
                provider: new McmaProvider(event.data),
            },
        });
    }

    onViewComponent(event) {
        this.dialogService.open(ViewDeployedComponentDialogComponent, {
            context: {
                component: new McmaDeployedComponent(event.data),
                deployedComponents: this.deployedComponents,
            },
        });
    }
}
