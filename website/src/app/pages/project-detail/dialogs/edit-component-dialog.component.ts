import { Component, Input, OnInit } from "@angular/core";

import { McmaComponent, McmaModule, McmaVariable } from "@local/commons";

import { NbDialogRef } from "@nebular/theme";
import { ModuleRepositoryData } from "../../../@core/data/module-repository";

interface Variable {
    name: string;
    value: string;
}

@Component({
    selector: "mcma-edit-component-dialog",
    templateUrl: "edit-component-dialog.component.html",
    styleUrls: ["edit-component-dialog.component.scss"],
})
export class EditComponentDialogComponent implements OnInit {
    @Input() component: McmaComponent;

    action: string = "Add";

    namespaces: string[] = [];
    modules: string[] = [];
    versions: string[] = [];

    selectedNamespace: string;
    selectedModule: string;
    selectedVersion: string;

    module: McmaModule;

    componentCode: string = null;
    componentDisplayName: string = null;
    componentModule: string;
    componentVariableMap: Map<string, string> = new Map<string, string>();
    componentVariables: Variable[] = [];

    constructor(protected ref: NbDialogRef<EditComponentDialogComponent>, private moduleRepository: ModuleRepositoryData) {
    }

    ngOnInit() {
        this.action = !this.component.id ? "Add" : "Edit";
        this.componentCode = this.component.name;
        this.componentDisplayName = this.component.displayName;
        this.componentModule = this.component.module;

        for (const variable of this.component.variables) {
            this.componentVariableMap.set(variable.name, variable.value);
        }

        if (this.component.module) {
            const moduleComponents = this.component.module.split("/");
            this.selectedVersion = moduleComponents[moduleComponents.length - 2];
            this.selectedModule = moduleComponents[moduleComponents.length - 3];
            this.selectedNamespace = moduleComponents[moduleComponents.length - 4];
        }

        this.moduleRepository.getNamespaces().subscribe(namespaces => {
            this.namespaces.length = 0;
            this.namespaces.push(...namespaces);
            this.onNamespaceChange(this.selectedNamespace);
        });
    }

    cancel() {
        this.ref.close();
    }

    submit() {
        this.ref.close(new McmaComponent({
            name: this.componentCode,
            displayName: this.componentDisplayName,
            module: this.componentModule,
            variables: this.getComponentVariables(),
        }));
    }

    onNamespaceChange(event) {
        let namespace = event;
        if (!namespace) {
            namespace = this.namespaces.length > 0 ? this.namespaces[0] : "";
        }

        this.selectedNamespace = namespace;

        this.moduleRepository.getModules(this.selectedNamespace).subscribe(modules => {
            this.modules = modules;
            this.onModuleChange(this.selectedModule);
        });
    }

    onModuleChange(event) {
        let module = event;
        if (!event) {
            module = this.modules.length > 0 ? this.modules[0] : "";
        }

        this.selectedModule = module;

        this.moduleRepository.getVersions(this.selectedNamespace, this.selectedModule).subscribe(versions => {
            this.versions = versions;
            this.onVersionChange(this.selectedVersion);
        });
    }

    onVersionChange(event) {
        let version = event;
        if (!event) {
            version = this.versions.length > 0 ? this.versions[this.versions.length - 1] : "";
        }

        this.selectedVersion = version;

        this.moduleRepository.getModule(this.selectedNamespace, this.selectedModule, this.selectedVersion).subscribe(module => {
            const updateCode = !this.componentCode || (this.module && this.module.name === this.componentCode);
            const updateDisplayName = !this.componentDisplayName || (this.module && this.module.displayName === this.componentDisplayName);

            this.module = module;

            if (updateCode) {
                this.componentCode = module.name;
            }
            if (updateDisplayName) {
                this.componentDisplayName = module.displayName;
            }

            this.componentModule = module.id;
            this.componentVariables = [];

            if (module) {
                for (const param of module.inputParameters) {
                    this.componentVariables.push({ name: param.name, value: null });
                }
            }

            for (const variable of this.componentVariables) {
                if (this.componentVariableMap.has(variable.name)) {
                    variable.value = this.componentVariableMap.get(variable.name);
                }
            }
        });
    }

    onVariableChange(name: string, value: string) {
        this.componentVariableMap.set(name, value);
    }

    private getComponentVariables(): object {
        const list = [];

        if (this.module) {
            for (const param of this.module.inputParameters) {
                list.push(new McmaVariable({
                    name: param.name,
                    value: this.componentVariableMap.has(param.name) ? this.componentVariableMap.get(param.name) : null,
                }));
            }
        }

        return list;
    }
}
