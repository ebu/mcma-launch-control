export class VariableResolver {
    private readonly map: Map<string, string>;

    constructor() {
        this.map = new Map<string, string>();
    }

    put(name: string, value: string) {
        this.map.set(name, value);
    }

    resolve(str: string): string {
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
                        if (this.map.has(name)) {
                            result += this.map.get(name);
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
