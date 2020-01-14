import { Resource } from "@mcma/core";

export class McmaComponent extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    module: string;
    variables: object;
}
