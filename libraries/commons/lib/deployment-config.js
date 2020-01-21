const { Resource } = require("@mcma/core");
const { McmaVariable } = require("./variable");

class McmaDeploymentConfig extends Resource {
    constructor(properties) {
        super("McmaDeploymentConfig", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.name = (properties && properties.name) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.variables = properties && properties.variables;

        if (!Array.isArray(this.variables)) {
            this.variables = [];
        }

        this.variables = this.variables.map(v => new McmaVariable(v));
    }
}

module.exports = {
    McmaDeploymentConfig,
};
