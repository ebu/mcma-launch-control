import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { McmaComponent, McmaModule } from "@local/commons";
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
    modules: McmaModule[] = [];

    componentCode: string = null;
    componentDisplayName: string = null;
    componentModule: string;
    componentVariableMap: Map<string, string> = new Map<string, string>();
    componentVariables: Variable[] = [];

    constructor(protected ref: NbDialogRef<EditComponentDialogComponent>, private moduleRepository: ModuleRepositoryData) {
    }

    ngOnInit(): void {
        this.moduleRepository.getModules().subscribe(modules => {
            this.action = !this.component.id ? "Add" : "Edit";

            this.modules = modules;

            this.componentCode = this.component.name;
            this.componentDisplayName = this.component.displayName;
            this.componentModule = this.component.module;

            for (const varName in this.component.variables) {
                if (this.component.variables.hasOwnProperty(varName)) {
                    this.componentVariableMap.set(varName, this.component.variables[varName]);
                }
            }

            this.onModuleChange(this.componentModule);
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

    onModuleChange(event) {
        this.componentVariables = [];

        const module = this.modules.find(m => m.id === event);
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
    }

    onVariableChange(name: string, value: string) {
        this.componentVariableMap.set(name, value);
    }

    private getComponentVariables(): object {
        const map = {};

        const module = this.modules.find(m => m.id === this.componentModule);
        if (module) {
            for (const param of module.inputParameters) {
                map[param.name] = this.componentVariableMap.has(param.name) ? this.componentVariableMap.get(param.name) : null;
            }
        }

        return map;
    }
}
