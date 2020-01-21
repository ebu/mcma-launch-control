import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { McmaProvider, McmaVariable } from "@local/commons";

@Component({
    selector: "mcma-edit-provider-dialog",
    templateUrl: "edit-provider-dialog.component.html",
    styleUrls: ["edit-provider-dialog.component.scss"],
})
export class EditProviderDialogComponent implements OnInit {

    @Input() provider: McmaProvider;

    action: string = "Add";
    providerTypes = [
        {
            name: "aws",
            displayName: "AWS Provider",
            inputParameters: [
                {
                    "name": "version",
                    "type": "string",
                },
                {
                    "name": "region",
                    "type": "string",
                },
                {
                    "name": "access_key",
                    "type": "string",
                },
                {
                    "name": "secret_key",
                    "type": "string",
                },
            ],
        },
        {
            name: "azurerm",
            displayName: "Azure Provider",
            inputParameters: [
                {
                    "name": "version",
                    "type": "string",
                },
                {
                    "name": "subscription_id",
                    "type": "string",
                },
                {
                    "name": "client_id",
                    "type": "string",
                },
                {
                    "name": "client_secret",
                    "type": "string",
                },
                {
                    "name": "tenant_id",
                    "type": "string",
                },
            ],
        },
        {
            name: "azuread",
            displayName: "Azure Active Directory Provider",
            inputParameters: [
                {
                    "name": "version",
                    "type": "string",
                },
                {
                    "name": "subscription_id",
                    "type": "string",
                },
                {
                    "name": "client_id",
                    "type": "string",
                },
                {
                    "name": "client_secret",
                    "type": "string",
                },
                {
                    "name": "tenant_id",
                    "type": "string",
                },
            ],
        },
        {
            name: "google",
            displayName: "Google Cloud Platform Provider",
            inputParameters: [
                {
                    "name": "credentials",
                    "type": "string",
                },
                {
                    "name": "project",
                    "type": "string",
                },
                {
                    "name": "region",
                    "type": "string",
                },
            ],
        },
    ];

    providerCode: string = null;
    providerDisplayName: string = null;
    providerType: any;
    providerVariableMap: Map<string, string> = new Map<string, string>();
    providerVariables: { name: string, value: string }[] = [];

    constructor(protected ref: NbDialogRef<EditProviderDialogComponent>) {
    }

    cancel() {
        this.ref.close();
    }

    submit() {
        this.ref.close(new McmaProvider({
            name: this.providerCode,
            displayName: this.providerDisplayName,
            type: this.providerType.name,
            variables: this.getProviderVariables(),
        }));
    }

    ngOnInit() {
        this.action = !this.provider.name ? "Add" : "Edit";
        this.providerCode = this.provider.name;
        this.providerDisplayName = this.provider.displayName;
        this.providerType = this.providerTypes.find(type => type.name === this.provider.type);

        for (const variable of this.provider.variables) {
            this.providerVariableMap.set(variable.name, variable.value);
        }

        this.onProviderTypeChange(this.providerType);
    }

    onProviderTypeChange(event) {
        let providerType = event;
        if (!providerType) {
            providerType = this.providerTypes.length > 0 ? this.providerTypes[0] : null;
        }

        const updateCode = !this.providerCode || (this.providerType && this.providerType.name === this.providerCode);
        const updateDisplayName = !this.providerDisplayName || (this.providerType && this.providerType.displayName === this.providerDisplayName);

        this.providerType = providerType;

        if (updateCode) {
            this.providerCode = this.providerType.name;
        }
        if (updateDisplayName) {
            this.providerDisplayName = this.providerType.displayName;
        }

        this.providerVariables = [];

        if (this.providerType) {
            for (const param of this.providerType.inputParameters) {
                this.providerVariables.push({ name: param.name, value: null });
            }
        }

        for (const variable of this.providerVariables) {
            if (this.providerVariableMap.has(variable.name)) {
                variable.value = this.providerVariableMap.get(variable.name);
            }
        }
    }

    onVariableChange(name: string, value: string) {
        this.providerVariableMap.set(name, value);
    }

    private getProviderVariables() {
        const list = [];

        if (this.providerType) {
            for (const param of this.providerType.inputParameters) {
                list.push(new McmaVariable({
                    name: param.name,
                    value: this.providerVariableMap.has(param.name) ? this.providerVariableMap.get(param.name) : null,
                }));
            }
        }

        return list;
    }

}

