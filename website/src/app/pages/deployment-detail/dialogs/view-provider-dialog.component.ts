import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { McmaProvider } from "@local/commons";

@Component({
    selector: "mcma-edit-provider-dialog",
    templateUrl: "view-provider-dialog.component.html",
    styleUrls: ["view-provider-dialog.component.scss"],
})
export class ViewProviderDialogComponent implements OnInit {

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
        },
        {
            name: "azuread",
            displayName: "Azure Active Directory Provider",
        },
        {
            name: "google",
            displayName: "Google Cloud Platform Provider",
        },
    ];

    providerCode: string = null;
    providerDisplayName: string = null;
    providerType: any;
    providerVariableMap: Map<string, string> = new Map<string, string>();
    providerVariables: { name: string, value: string }[] = [];

    constructor(protected ref: NbDialogRef<ViewProviderDialogComponent>) {
    }

    close() {
        this.ref.close();
    }

    ngOnInit() {
        this.action = !this.provider.name ? "Add" : "Edit";
        this.providerCode = this.provider.name;
        this.providerDisplayName = this.provider.displayName;
        this.providerType = this.providerTypes.find(type => type.name === this.provider.type);
    }

}

