import { Resource } from "@mcma/core";

export class McmaDeploymentConfig extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    variables: object;
}
