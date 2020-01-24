import { McmaVariable } from "@local/commons";

class VariableResolveNode {
    readonly variable: McmaVariable;
    readonly dependencies: Set<string>;

    constructor(variable) {
        this.variable = variable;
        this.dependencies = VariableResolveNode.computeDependencies(variable.value);
    }

    private static computeDependencies(str: string) {
        const dependencies = new Set<string>();

        let state = 0;
        let start = 0;

        for (let i = 0; i < str.length; i++) {
            const c = str.charAt(i);

            switch (state) {
                case 0:
                    if (c === "$") {
                        state = 1;
                        start = i;
                    }
                    break;
                case 1:
                    if (c === "{") {
                        state = 2;
                    } else if (c !== "$") {
                        state = 0;
                    } else {
                        start = i;
                    }
                    break;
                case 2:
                    if (c === "}") {
                        const name = str.substring(start + 2, i);
                        dependencies.add(name);
                        state = 0;
                        start = i + 1;
                    }
                    break;
            }
        }

        return dependencies;
    }
}

export class VariableResolver {
    private readonly map: Map<string, VariableResolveNode>;

    constructor(vr?: VariableResolver) {
        this.map = new Map<string, VariableResolveNode>();

        if (vr) {
            this.putAll(vr.getAll());
        }
    }

    has(name: string): boolean {
        return this.map.has(name);
    }

    get(name: string): McmaVariable {
        if (this.map.has(name)) {
            return this.map.get(name).variable;
        }
        return undefined;
    }

    put(variable: McmaVariable) {
        this.map.set(variable.name, new VariableResolveNode(variable));
    }

    getAll(): McmaVariable[] {
        const list = [];

        for (const node of this.map.values()) {
            list.push(node.variable);
        }

        return list;
    }

    putAll(variables: McmaVariable[]) {
        for (const variable of variables) {
            this.map.set(variable.name, new VariableResolveNode(variable));
        }
    }

    resolve(variable: string | McmaVariable): McmaVariable {
        if (typeof variable === "string") {
            variable = new McmaVariable({ value: variable });
        }

        return this.resolveNode(new VariableResolveNode(variable), new Map<string, McmaVariable>(), new Set<string>());
    }

    private resolveNode(node: VariableResolveNode, resolved: Map<string, McmaVariable>, unresolved: Set<string>): McmaVariable {
        unresolved.add(node.variable.name);
        for (const dependency of node.dependencies) {
            if (unresolved.has(dependency)) {
                throw new Error("Circular reference detected: " + node.variable.name + " -> " + dependency);
            }
            if (!resolved.has(dependency)) {
                if (this.map.has(dependency)) {
                    resolved.set(dependency, this.resolveNode(this.map.get(dependency), resolved, unresolved));
                }
            }
        }
        unresolved.delete(node.variable.name);

        const str = node.variable.value;
        let state = 0;
        let start = 0;
        let value = "";
        let secure = node.variable.secure;

        for (let i = 0; i < str.length; i++) {
            const c = str.charAt(i);

            switch (state) {
                case 0:
                    if (c === "$") {
                        value += str.substring(start, i);
                        state = 1;
                        start = i;
                    }
                    break;
                case 1:
                    if (c === "{") {
                        state = 2;
                    } else if (c !== "$") {
                        state = 0;
                    } else {
                        value += "$";
                        start = i;
                    }
                    break;
                case 2:
                    if (c === "}") {
                        const nodeName = str.substring(start + 2, i);
                        if (resolved.has(nodeName)) {
                            const resolvedNode = resolved.get(nodeName);
                            value += resolvedNode.value;
                            secure = secure || resolvedNode.secure;
                        } else {
                            value += str.substring(start, i + 1);
                        }
                        state = 0;
                        start = i + 1;
                    }
                    break;
            }
        }

        value += str.substring(start);

        return new McmaVariable({
            name: node.variable.name,
            value,
            secure,
        });
    }
}
