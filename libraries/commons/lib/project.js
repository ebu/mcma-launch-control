const { McmaProvider } = require("./provider");
const { Resource } = require("@mcma/core");
const { McmaVariable } = require("./variable");

class McmaProject extends Resource {
    constructor(properties) {
        super("McmaProject", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.name = (properties && properties.name) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.variables = properties && properties.variables;
        this.providers = properties && properties.providers;

        if (!Array.isArray(this.variables)) {
            this.variables = [];
        }
        if (!Array.isArray(this.providers)) {
            this.providers = [];
        }

        this.variables = this.variables.map(v => new McmaVariable(v));
        this.providers = this.providers.map(v => new McmaProvider(v));
    }
}

module.exports = {
    McmaProject,
};
