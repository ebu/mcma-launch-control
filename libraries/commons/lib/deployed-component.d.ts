import { Resource } from "@mcma/core";

export class McmaDeployedComponent extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    module: string;
    variables: object;
    inputVariables: object;
    outputVariables: object;
    resources: object;
}
