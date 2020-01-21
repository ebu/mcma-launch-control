const { McmaVariable } = require("./variable");
const { Resource } = require("@mcma/core");

class McmaDeployedComponent extends Resource {
    constructor(properties) {
        super("McmaDeployedComponent", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.name = (properties && properties.name) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.module = (properties && properties.module) || null;
        this.variables = properties && properties.variables;
        this.inputVariables = properties && properties.inputVariables;
        this.outputVariables = properties && properties.outputVariables;
        this.resources = properties && properties.resources;

        if (!Array.isArray(this.variables)) {
            this.variables = [];
        }
        if (!Array.isArray(this.inputVariables)) {
            this.inputVariables = [];
        }
        if (!Array.isArray(this.outputVariables)) {
            this.outputVariables = [];
        }
        if (!Array.isArray(this.resources)) {
            this.resources = [];
        }

        this.variables = this.variables.map(v => new McmaVariable(v));
        this.inputVariables = this.inputVariables.map(v => new McmaVariable(v));
        this.outputVariables = this.outputVariables.map(v => new McmaVariable(v));
        this.resources = this.resources.map(v => new McmaVariable(v));
    }
}

module.exports = {
    McmaDeployedComponent,
};
