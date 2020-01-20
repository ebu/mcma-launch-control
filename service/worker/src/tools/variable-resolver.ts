class VariableResolveNode {
    readonly name: string;
    readonly value: string;
    readonly dependencies: Set<string>;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
        this.dependencies = VariableResolveNode.computeDependencies(this.value);
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

    constructor() {
        this.map = new Map<string, VariableResolveNode>();
    }

    put(name: string, value: string) {
        this.map.set(name, new VariableResolveNode(name, value));
    }

    resolve(str: string): string {
        return this.resolveNode(new VariableResolveNode("", str), new Map<string, string>(), new Set<string>());
    }

    private resolveNode(node: VariableResolveNode, resolved: Map<string, string>, unresolved: Set<string>) {
        unresolved.add(node.name);
        for (const dependency of node.dependencies) {
            if (unresolved.has(dependency)) {
                throw new Error("Circular reference detected: " + node.name + " -> " + dependency);
            }
            if (!resolved.has(dependency)) {
                if (this.map.has(dependency)) {
                    resolved.set(dependency, this.resolveNode(this.map.get(dependency), resolved, unresolved));
                }
            }
        }
        unresolved.delete(node.name);

        const str = node.value;
        let state = 0;
        let start = 0;
        let result = "";

        for (let i = 0; i < str.length; i++) {
            const c = str.charAt(i);

            switch (state) {
                case 0:
                    if (c === "$") {
                        result += str.substring(start, i);
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
                        result += "$";
                        start = i;
                    }
                    break;
                case 2:
                    if (c === "}") {
                        const name = str.substring(start + 2, i);
                        if (resolved.has(name)) {
                            result += resolved.get(name);
                        } else {
                            result += str.substring(start, i);
                        }
                        state = 0;
                        start = i + 1;
                    }
                    break;
            }
        }

        result += str.substring(start);

        return result;
    }
}
