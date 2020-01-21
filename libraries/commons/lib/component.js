const { McmaVariable } = require("./variable");
const { Resource } = require("@mcma/core");

class McmaComponent extends Resource {
    constructor(properties) {
        super("McmaComponent", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.name = (properties && properties.name) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.module = (properties && properties.module) || null;
        this.variables = properties && properties.variables;

        if (!Array.isArray(this.variables)) {
            this.variables = [];
        }

        this.variables = this.variables.map(v => new McmaVariable(v));
    }
}

module.exports = {
    McmaComponent,
};
