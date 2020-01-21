import { Resource } from "@mcma/core";
import { McmaVariable } from "./variable";

export class McmaDeployedComponent extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    module: string;
    variables: McmaVariable[];
    inputVariables: McmaVariable[];
    outputVariables: McmaVariable[];
    resources: McmaVariable[];
}
