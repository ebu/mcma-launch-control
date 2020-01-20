import { Resource } from "@mcma/core";
import { McmaProvider } from "./provider";

export class McmaProject extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    variables: object;
    providers: McmaProvider[];
}
