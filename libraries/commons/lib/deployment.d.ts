import { Resource } from "@mcma/core";

export enum McmaDeploymentStatus {
    OK = "OK",
    Error = "Error",
    Deploying = "Deploying",
    Destroying = "Destroying"
}

export class McmaDeployment extends Resource {
    constructor(properties?: object);

    project: string;
    config: string;
    status: McmaDeploymentStatus;
    statusMessage: string;
    variables: object;
}
