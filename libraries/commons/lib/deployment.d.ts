import { Resource } from "@mcma/core";

export enum McmaDeploymentStatus {
    OK = "OK",
    ERROR = "ERROR",
    DEPLOYING = "DEPLOYING",
    DESTROYING = "DESTROYING"
}

export class McmaDeployment extends Resource {
    constructor(properties?: object);

    project: string;
    config: string;
    status: McmaDeploymentStatus;
    statusMessage: string;
    variables: object;
}
