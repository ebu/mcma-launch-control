import { Component, Input, OnInit } from "@angular/core";

import { McmaComponent, McmaModule } from "@local/commons";

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

    providers: string[] = [];
    modules: string[] = [];
    versions: string[] = [];

    selectedProvider: string;
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

        for (const varName in this.component.variables) {
            if (this.component.variables.hasOwnProperty(varName)) {
                this.componentVariableMap.set(varName, this.component.variables[varName]);
            }
        }

        if (this.component.module) {
            const moduleComponents = this.component.module.split("/");
            this.selectedVersion = moduleComponents[moduleComponents.length - 2];
            this.selectedModule = moduleComponents[moduleComponents.length - 3];
            this.selectedProvider = moduleComponents[moduleComponents.length - 4];
        }

        this.moduleRepository.getProviders().subscribe(providers => {
            this.providers.length = 0;
            this.providers.push(...providers);
            this.onProviderChange(this.selectedProvider);
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

    onProviderChange(event) {
        let provider = event;
        if (!provider) {
            provider = this.providers.length > 0 ? this.providers[0] : "";
        }

        this.selectedProvider = provider;

        this.moduleRepository.getModules(this.selectedProvider).subscribe(modules => {
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

        this.moduleRepository.getVersions(this.selectedProvider, this.selectedModule).subscribe(versions => {
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

        this.moduleRepository.getModule(this.selectedProvider, this.selectedModule, this.selectedVersion).subscribe(module => {
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
        const map = {};

        if (this.module) {
            for (const param of this.module.inputParameters) {
                map[param.name] = this.componentVariableMap.has(param.name) ? this.componentVariableMap.get(param.name) : null;
            }
        }

        return map;
    }
}
