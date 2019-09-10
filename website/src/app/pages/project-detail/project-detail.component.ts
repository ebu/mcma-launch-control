import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { McmaDeployment, McmaDeploymentConfig, McmaProject } from "commons";
import { takeWhile } from "rxjs/operators";
import { LaunchControlData } from "../../@core/data/launch-control";
import { LocalDataSource } from "ng2-smart-table";

@Component({
    selector: "mcma-project-detail",
    templateUrl: "./project-detail.component.html",
    styleUrls: ["project-detail.component.scss"],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
    private alive = true;

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
        },
    };

    deploymentSource: LocalDataSource = new LocalDataSource();

    constructor(private launchControlService: LaunchControlData, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.launchControlService.getProject(this.route.snapshot.params["projectName"])
            .pipe(takeWhile(() => this.alive))
            .subscribe(project => this.loadProject(project));

        this.launchControlService.getDeploymentConfigs()
            .pipe(takeWhile(() => this.alive))
            .subscribe(deploymentConfigs => this.loadDeployments(deploymentConfigs, this.projectDeployments));
    }

    ngOnDestroy(): void {
        this.alive = false;
    }

    private loadProject(project: McmaProject) {
        this.project = project;

        this.launchControlService.getComponents(project.name)
            .pipe(takeWhile(() => this.alive))
            .subscribe(components => this.componentSource.load(components));

        this.launchControlService.getDeployments(project.name)
            .pipe(takeWhile(() => this.alive))
            .subscribe(deployments => this.loadDeployments(this.deploymentConfigs, deployments));
    }

    private loadDeployments(deploymentConfigs: McmaDeploymentConfig[], projectDeployments: McmaDeployment[]) {
        this.deploymentConfigs = deploymentConfigs;
        this.projectDeployments = projectDeployments;

        if (!deploymentConfigs || !projectDeployments) {
            return;
        }

        const deploymentMap = {};

        for (const deployment of this.projectDeployments) {
            deploymentMap[deployment.config] = deployment;
        }

        const deployments = [];

        for (const config of this.deploymentConfigs) {
            const deployment = (<McmaDeployment>deploymentMap[config.id]);

            deployments.push({
                name: config.name,
                displayName: config.displayName,
                status: deployment ? deployment.status : "",
                statusMessage: deployment ? deployment.status : "",
            });
        }

        this.deploymentSource.load(deployments);
    }

    onAddComponent() {

    }

    onEditComponent(event) {
        console.log(event);
    }

    onDeleteComponent(event) {
        console.log(event);
    }

    onUpdateDeployment(event) {
        console.log(event);
    }

    onDeleteDeployment(event) {
        console.log(event);
    }

}
