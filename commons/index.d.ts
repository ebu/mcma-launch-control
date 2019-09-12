import { Resource } from "@mcma/core";

export class McmaComponent extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    module: string;
    variables: object;
}

export class McmaDeployedComponent extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    module: string;
    inputVariables: object;
    outputVariables: object;
}

export class McmaDeploymentConfig extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    variables: object;
}

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

export class McmaProject extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    variables: object;
}

export class McmaModule extends Resource {
    constructor(properties?: object);

    provider: string;
    name: string;
    version: string;
    displayName: string;
    description: string;
    inputParameters: McmaModuleParameter[];
    outputParameters: McmaModuleParameter[];
}

export class McmaModuleParameter {
    constructor(properties?: object);

    name: string;
    type: string;
}
