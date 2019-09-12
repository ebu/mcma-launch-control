import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { McmaComponent, McmaDeployment, McmaDeploymentConfig, McmaDeploymentStatus, McmaProject } from "commons";
import { iif, of } from "rxjs";
import { switchMap, takeWhile } from "rxjs/operators";
import { LaunchControlData } from "../../@core/data/launch-control";
import { LocalDataSource } from "ng2-smart-table";
import { NbDialogService } from "@nebular/theme";
import { EditComponentDialogComponent } from "./dialogs/edit-component-dialog.component";
import { DeleteComponentDialogComponent } from "./dialogs/delete-component-dialog.component";

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

    projectDeployments: McmaDeployment[];

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
            },
            displayName: {
                title: "Display Name",
                type: "string",
                width: "75%",
            },
        },
    };

    componentSource: LocalDataSource = new LocalDataSource();

    deploymentSettings = {
        add: {
            addButtonContent: "<i class=\"nb-plus\"></i>",
            createButtonContent: "<i class=\"nb-checkmark\"></i>",
            cancelButtonContent: "<i class=\"nb-close\"></i>",
        },
        edit: {
            editButtonContent: "<i class=\"nb-loop\" title=\"Update\"></i>",
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
            },
            displayName: {
                title: "Display Name",
                type: "string",
                width: "75%",
            },
            status: {
                title: "Status",
                type: "string",
            },
            statusMessage: {
                title: "Status Message",
                type: "string",
            },
        },

        rowClassFunction: (row) => {
            switch (row.data.status) {
                case McmaDeploymentStatus.DEPLOYING:
                    return "rotating-loop disabled-trash";
                case McmaDeploymentStatus.DESTROYING:
                    return "rotating-trash disabled-loop";
                case McmaDeploymentStatus.OK:
                case McmaDeploymentStatus.ERROR:
                    return "";
                default:
                    return "disabled-trash";
            }
        },
    };

    deploymentSource: LocalDataSource = new LocalDataSource();

    private deployments = [];

    constructor(private launchControlService: LaunchControlData, private route: ActivatedRoute, private dialogService: NbDialogService) {
    }

    ngOnInit(): void {
        this.launchControlService.getProject(this.route.snapshot.params["projectName"])
            .pipe(takeWhile(() => this.alive))
            .subscribe(project => this.loadProject(project));

        this.launchControlService.getDeploymentConfigs()
            .pipe(takeWhile(() => this.alive))
            .subscribe(deploymentConfigs => this.innerLoadDeployments(deploymentConfigs, this.projectDeployments));
    }

    ngOnDestroy(): void {
        this.alive = false;
    }

    private loadProject(project: McmaProject) {
        this.project = project;

        this.loadComponents();
        this.loadDeployments();
    }

    private loadComponents() {
        this.launchControlService.getComponents(this.project.name)
            .pipe(takeWhile(() => this.alive))
            .subscribe(components => this.componentSource.load(components));
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

            if (deployment && deployment.status !== McmaDeploymentStatus.OK && deployment.status !== McmaDeploymentStatus.ERROR) {
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

    onAddComponent() {
        this.dialogService.open(EditComponentDialogComponent, {
            context: {
                component: new McmaComponent(),
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

    onUpdateDeployment(event) {
        this.launchControlService.updateDeployment(this.project.name, event.data.name).subscribe(() => this.loadDeployments());
    }

    onDeleteDeployment(event) {
        this.launchControlService.deleteDeployment(this.project.name, event.data.name).subscribe(() => this.loadDeployments());
    }

}
