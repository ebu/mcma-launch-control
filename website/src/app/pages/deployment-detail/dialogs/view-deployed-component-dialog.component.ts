import { Component, Input, OnInit } from "@angular/core";

import { McmaDeployedComponent, McmaVariable } from "@local/commons";

import { NbDialogRef } from "@nebular/theme";

@Component({
    selector: "mcma-view-deployed-component-dialog",
    templateUrl: "view-deployed-component-dialog.component.html",
    styleUrls: ["view-deployed-component-dialog.component.scss"],
})
export class ViewDeployedComponentDialogComponent implements OnInit {
    @Input() component: McmaDeployedComponent;
    @Input() deployedComponents: McmaDeployedComponent[];

    moduleNamespace: string;
    moduleName: string;
    moduleVersion: string;

    componentCode: string = null;
    componentDisplayName: string = null;

    componentInputVariables: McmaVariable[];

    constructor(protected ref: NbDialogRef<ViewDeployedComponentDialogComponent>) {
    }

    ngOnInit() {
        this.componentCode = this.component.name;
        this.componentDisplayName = this.component.displayName;

        if (this.component.module) {
            const moduleComponents = this.component.module.split("/");
            this.moduleVersion = moduleComponents[moduleComponents.length - 2];
            this.moduleName = moduleComponents[moduleComponents.length - 3];
            this.moduleNamespace = moduleComponents[moduleComponents.length - 4];
        }

        this.componentInputVariables = [];
        for (const variable of this.component.inputVariables) {
            const v = new McmaVariable(variable);
            if (v.value.startsWith("${module.")) {
                const deployedComponent = this.deployedComponents.find(dc => v.value === "${module." + dc.name + "}");
                if (deployedComponent) {
                    v.value = deployedComponent.displayName;
                }
            }
            this.componentInputVariables.push(v);
        }
    }

    close() {
        this.ref.close();
    }
}
