import { Resource } from "@mcma/core";

export class McmaModule extends Resource {
    constructor(properties?: object);

    namespace: string;
    name: string;
    provider: string;
    version: string;
    displayName: string;
    description: string;
    link: string;
    providers: any[];
    inputParameters: McmaModuleParameter[];
    outputParameters: McmaModuleParameter[];
    deploymentActions: McmaModuleDeploymentAction[];
}

export class McmaModuleParameter {
    constructor(properties?: object);

    name: string;
    type: string;
}

export enum McmaModuleDeploymentActionType {
    ManagedResource = "ManagedResource",
    RunScript = "RunScript",
}

export class McmaModuleDeploymentAction {
    constructor(properties?: object);

    type: McmaModuleDeploymentActionType;
    data: any;
}
