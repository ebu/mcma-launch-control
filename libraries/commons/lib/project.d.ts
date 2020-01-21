import { Resource } from "@mcma/core";
import { McmaProvider } from "./provider";
import { McmaVariable } from "./variable";

export class McmaProject extends Resource {
    constructor(properties?: object);

    name: string;
    displayName: string;
    variables: McmaVariable[];
    providers: McmaProvider[];
}
