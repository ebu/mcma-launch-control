import { Resource } from "@mcma/core";

export class McmaModule extends Resource {
    constructor(properties?: object);

    provider: string;
    name: string;
    version: string;
    displayName: string;
    description: string;
    link: string;
    inputParameters: McmaModuleParameter[];
    outputParameters: McmaModuleParameter[];
    postDeploymentActions: McmaModuleAction[];
}

export class McmaModuleParameter {
    constructor(properties?: object);

    name: string;
    type: string;
}

export enum McmaModuleActionType {
    CreateResource = "CreateResource"
}

export class McmaModuleAction {
    constructor(properties?: object);

    type: McmaModuleAction;
    data: any;
}
