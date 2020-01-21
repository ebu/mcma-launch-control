import { McmaObject } from "@mcma/core";

export interface IMcmaVariable {
    name?: string;
    value: string;
    secure?: boolean;
}

export class McmaVariable extends McmaObject implements IMcmaVariable{
    constructor(properties?: IMcmaVariable);

    name: string;
    value: string;
    secure: boolean;
}
