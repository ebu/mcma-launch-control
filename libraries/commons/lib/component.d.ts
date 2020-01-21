import { Resource } from "@mcma/core";
import { McmaVariable } from "./variable";

export class McmaComponent extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    module: string;
    variables: McmaVariable[];
}
