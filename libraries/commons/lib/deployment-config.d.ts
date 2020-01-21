import { Resource } from "@mcma/core";
import { McmaVariable } from "./variable";

export class McmaDeploymentConfig extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    variables: McmaVariable[];
}
