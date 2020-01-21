import { McmaObject } from "@mcma/core";
import { McmaVariable } from "./variable";

export enum McmaProviderType {
    AWS = "aws",
    AzureRM = "azurerm",
    AzureAD = "azuread",
    Google = "google",
}

export class McmaProvider extends McmaObject {
    constructor(properties?: object);

    name: string;
    displayName: string;
    type: McmaProviderType;
    variables: McmaVariable[];
}
