const { Resource } = require("@mcma/core");

class McmaDeploymentConfig extends Resource {
    constructor(properties) {
        super("McmaDeploymentConfig", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.name = (properties && properties.name) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.variables = (properties && properties.variables) || {};
    }
}

module.exports = {
    McmaDeploymentConfig,
};
