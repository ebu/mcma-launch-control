import { Resource } from "@mcma/core";

export enum McmaProviderType {
    AWS = "aws",
    AzureRM = "azurerm",
    AzureAD = "azuread",
    Google = "google",
}

export class McmaProvider extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    providerType: McmaProviderType;
    variables: object;
}
