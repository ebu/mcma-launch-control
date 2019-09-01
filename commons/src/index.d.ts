import { Resource } from "@mcma/core";

interface Map<K, V> {}

export class McmaComponent extends Resource {
    constructor(properties: any);

    name: string;
    displayName: string;
    module: string;
    variables: Map<string, string>;
}

export class McmaDeployedComponent extends Resource {
    constructor(properties: any);

    name: string;
    displayName: string;
    module: string;
    inputVariables: Map<string, string>;
    outputVariables: Map<string, string>;
}

export class McmaDeploymentConfig extends Resource {
    constructor(properties: any);

    name: string;
    displayName: string;
    variables: Map<string, string>;
}

export enum McmaDeploymentStatus {
    OK = "OK",
    ERROR = "ERROR",
    DEPLOYING = "DEPLOYING",
    DESTROYING = "DESTROYING"
}

export class McmaDeployment extends Resource {
    constructor(properties: any);

    project: string;
    config: string;
    status: McmaDeploymentStatus;
    statusMessage: string;
    projectName: string;
    variables: Map<string, string>;
}

export class McmaProject extends Resource {
    constructor(properties: any);

    name: string;
    displayName: string;
    variables: Map<string, string>;
}
