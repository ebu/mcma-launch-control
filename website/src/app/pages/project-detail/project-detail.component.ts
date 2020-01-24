import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
    McmaComponent,
    McmaDeployment,
    McmaDeploymentConfig,
    McmaDeploymentStatus,
    McmaProject,
    McmaProvider,
    McmaVariable,
} from "@local/commons";
import { iif, of } from "rxjs";
import { map, switchMap, takeWhile } from "rxjs/operators";
import { LaunchControlData } from "../../@core/data/launch-control";
import { LocalDataSource } from "ng2-smart-table";
import { NbDialogService } from "@nebular/theme";


import { EditComponentDialogComponent } from "./dialogs/edit-component-dialog.component";
import { DeleteComponentDialogComponent } from "./dialogs/delete-component-dialog.component";
import { DeleteVariableDialogComponent } from "./dialogs/delete-variable-dialog.component";
import { EditVariableDialogComponent } from "./dialogs/edit-variable-dialog.component";
import { DeleteProviderDialogComponent } from "./dialogs/delete-provider-dialog.component";
import { EditProviderDialogComponent } from "./dialogs/edit-provider-dialog.component";

const equal = require("fast-deep-equal");

@Component({
    selector: "mcma-project-detail",
    templateUrl: "./project-detail.component.html",
    styleUrls: ["project-detail.component.scss"],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
    private alive = true;

    private deploymentReloadScheduled: boolean = false;

    project: McmaProject;

    deploymentConfigs: McmaDeploymentConfig[];

    projectComponents: McmaComponent[];
    projectDeployments: McmaDeployment[];

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

    providerSettings = {
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
                width: "20%",
            },
            displayName: {
                title: "Display Name",
                type: "string",
                width: "70%",
            },
        },
    };

    providerSource: LocalDataSource = new LocalDataSource();

    componentSettings = {
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
                width: "20%",
            },
            displayName: {
                title: "Display Name",
                type: "string",
                width: "70%",
            },
        },
    };

    componentSource: LocalDataSource = new LocalDataSource();

    deploymentSettings = {
        add: null,
        edit: null,
        delete: null,

        mode: "external",
        hideSubHeader: true,

        actions: {
            position: "right",
            custom: [
                {
                    name: "view",
                    title: "<i class=\"nb-search\" title=\"View\"></i>",
                },
                {
                    name: "deploy",
                    title: "<i class=\"nb-loop\" title=\"Deploy\"></i>",
                },
                {
                    name: "destroy",
                    title: "<i class=\"nb-trash\" title=\"Destroy\"></i>",
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
                width: "25%",
            },
            status: {
                title: "Status",
                type: "string",
                width: "10%",
            },
            statusMessage: {
                title: "Status Message",
                type: "string",
                width: "30%",
            },
        },

        rowClassFunction: (row) => {
            switch (row.data.status) {
                case McmaDeploymentStatus.Deploying:
                    return "rotating-loop disabled-trash";
                case McmaDeploymentStatus.Destroying:
                    return "rotating-trash disabled-loop";
                case McmaDeploymentStatus.OK:
                case McmaDeploymentStatus.Error:
                    return "";
                default:
                    return "disabled-search disabled-trash";
            }
        },
    };

    deploymentSource: LocalDataSource = new LocalDataSource();

    private deployments = [];

    constructor(private launchControlService: LaunchControlData, private route: ActivatedRoute, private dialogService: NbDialogService, private router: Router) {
    }

    ngOnInit() {
        this.launchControlService.getProject(this.route.snapshot.params["projectName"])
            .pipe(takeWhile(() => this.alive))
            .subscribe(project => this.loadProject(project));

        this.launchControlService.getDeploymentConfigs()
            .pipe(takeWhile(() => this.alive))
            .subscribe(deploymentConfigs => this.innerLoadDeployments(deploymentConfigs, this.projectDeployments));
    }

    ngOnDestroy() {
        this.alive = false;
    }

    private loadProject(project: McmaProject) {
        this.project = project;

        this.loadVariables();
        this.loadProviders();
        this.loadComponents();
        this.loadDeployments();
    }

    private loadVariables() {
        const variables = [];
        for (const variable of this.project.variables) {
            const copy = new McmaVariable(variable);
            if (copy.secure) {
                copy.value = "••••••••••••••••";
            }
            variables.push(copy);
        }

        this.variableSource.load(variables);
    }

    private loadProviders() {
        this.providerSource.load(this.project.providers);
    }

    private loadComponents() {
        this.launchControlService.getComponents(this.project.name)
            .pipe(takeWhile(() => this.alive))
            .subscribe(components => {
                this.projectComponents = components;
                this.componentSource.load(components);
            });
    }

    private loadDeployments() {
        this.launchControlService.getDeployments(this.project.name)
            .pipe(takeWhile(() => this.alive))
            .subscribe(deployments => this.innerLoadDeployments(this.deploymentConfigs, deployments));
    }

    private innerLoadDeployments(deploymentConfigs: McmaDeploymentConfig[], projectDeployments: McmaDeployment[]) {
        this.deploymentConfigs = deploymentConfigs;
        this.projectDeployments = projectDeployments;

        if (!deploymentConfigs || !projectDeployments) {
            return;
        }

        const deploymentMap = {};

        for (const deployment of this.projectDeployments) {
            deploymentMap[deployment.config] = deployment;
        }

        let transient = false;

        const deployments = [];

        for (const config of this.deploymentConfigs) {
            const deployment = (<McmaDeployment>deploymentMap[config.id]);

            deployments.push({
                name: config.name,
                displayName: config.displayName,
                status: deployment ? deployment.status : "",
                statusMessage: deployment ? deployment.statusMessage : "",
            });

            if (deployment && deployment.status !== McmaDeploymentStatus.OK && deployment.status !== McmaDeploymentStatus.Error) {
                transient = true;
            }
        }

        if (!equal(this.deployments, deployments)) {
            this.deploymentSource.load(deployments);
            this.deployments = deployments;
        }

        if (transient && !this.deploymentReloadScheduled) {
            this.deploymentReloadScheduled = true;
            setTimeout(() => {
                this.loadDeployments();
                this.deploymentReloadScheduled = false;
            }, 2000);
        }
    }

    onAddVariable() {
        this.dialogService.open(EditVariableDialogComponent, {
            context: {
                variable: new McmaVariable(),
            },
        }).onClose.pipe(
            takeWhile(variable => !!variable),
            map(variable => {
                const idx = this.project.variables.findIndex(p => variable.name === p.name);
                if (idx >= 0) {
                    this.project.variables.splice(idx, 1);
                }
                this.project.variables.push(variable);
                this.project.variables.sort((a, b) => a.name.localeCompare(b.name));
                return this.project;
            }),
            switchMap(project => this.launchControlService.setProject(project)),
        ).subscribe(() => this.loadVariables());
    }

    onEditVariable(event) {
        this.dialogService.open(EditVariableDialogComponent, {
            context: {
                variable: new McmaVariable(this.project.variables.find(v => v.name === event.data.name)),
            },
        }).onClose.pipe(
            takeWhile(variable => !!variable),
            map(variable => {
                const idx = this.project.variables.findIndex(p => event.data.name === p.name);
                if (idx >= 0) {
                    this.project.variables.splice(idx, 1);
                }
                this.project.variables.push(variable);
                this.project.variables.sort((a, b) => a.name.localeCompare(b.name));
                return this.project;
            }),
            switchMap(project => this.launchControlService.setProject(project)),
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
                const idx = this.project.variables.findIndex(p => event.data.name === p.name);
                if (idx >= 0) {
                    this.project.variables.splice(idx, 1);
                }
                return this.project;
            }),
            switchMap(project => this.launchControlService.setProject(project)),
        ).subscribe(() => this.loadVariables());
    }

    onAddProvider() {
        this.dialogService.open(EditProviderDialogComponent, {
            context: {
                provider: new McmaProvider(),
            },
        }).onClose.pipe(
            takeWhile(provider => !!provider),
            map(provider => {
                const idx = this.project.providers.findIndex(p => provider.name === p.name);
                if (idx >= 0) {
                    this.project.providers.splice(idx, 1);
                }
                this.project.providers.push(provider);
                this.project.providers.sort((a, b) => a.name.localeCompare(b.name));
                return this.project;
            }),
            switchMap(project => this.launchControlService.setProject(project)),
        ).subscribe(() => this.loadProviders());
    }

    onEditProvider(event) {
        this.dialogService.open(EditProviderDialogComponent, {
            context: {
                provider: new McmaProvider(event.data),
            },
        }).onClose.pipe(
            takeWhile(provider => !!provider),
            map(provider => {
                const idx = this.project.providers.findIndex(p => provider.name === p.name);
                if (idx >= 0) {
                    this.project.providers.splice(idx, 1);
                }
                this.project.providers.push(provider);
                this.project.providers.sort((a, b) => a.name.localeCompare(b.name));
                return this.project;
            }),
            switchMap(project => this.launchControlService.setProject(project)),
        ).subscribe(() => this.loadProviders());
    }

    onDeleteProvider(event) {
        this.dialogService.open(DeleteProviderDialogComponent, {
            context: {
                provider: new McmaProvider(event.data),
            },
        }).onClose.pipe(
            takeWhile(doDelete => doDelete),
            map(ignored => {
                const idx = this.project.providers.findIndex(p => event.data.name === p.name);
                if (idx >= 0) {
                    this.project.providers.splice(idx, 1);
                }
                return this.project;
            }),
            switchMap(project => this.launchControlService.setProject(project)),
        ).subscribe(() => this.loadProviders());
    }

    onAddComponent() {
        this.dialogService.open(EditComponentDialogComponent, {
            context: {
                component: new McmaComponent(),
                projectComponents: this.projectComponents,
            },
        }).onClose.pipe(
            takeWhile(component => !!component),
            switchMap(component => this.launchControlService.setComponent(this.project.name, component)),
        ).subscribe(() => this.loadComponents());
    }

    onEditComponent(event) {
        this.dialogService.open(EditComponentDialogComponent, {
            context: {
                component: new McmaComponent(event.data),
                projectComponents: this.projectComponents,
            },
        }).onClose.pipe(
            takeWhile(component => !!component),
            switchMap(component => this.launchControlService.setComponent(this.project.name, component)),
            switchMap(component => iif(() => event.data.name !== component.name, this.launchControlService.deleteComponent(this.project.name, event.data.name), of(component))),
        ).subscribe(() => this.loadComponents());
    }

    onDeleteComponent(event) {
        this.dialogService.open(DeleteComponentDialogComponent, {
            context: {
                component: new McmaComponent(event.data),
            },
        }).onClose.pipe(
            takeWhile(doDelete => doDelete),
            switchMap(() => this.launchControlService.deleteComponent(this.project.name, event.data.name)),
        ).subscribe(() => this.loadComponents());
    }

    onCustomDeployment(event) {
        switch (event.action) {
            case "view":
                this.router.navigate(["pages/projects/", this.project.name, "deployments", event.data.name]);
                break;
            case "deploy":
                this.launchControlService.updateDeployment(this.project.name, event.data.name).subscribe(() => this.loadDeployments());
                break;
            case "destroy":
                this.launchControlService.deleteDeployment(this.project.name, event.data.name).subscribe(() => this.loadDeployments());
                break;
        }
    }

}
