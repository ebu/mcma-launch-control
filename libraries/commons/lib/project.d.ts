import { Resource } from "@mcma/core";

export class McmaProject extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    variables: object;
}
