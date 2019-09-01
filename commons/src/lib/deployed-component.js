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
        this.inputVariables = (properties && properties.inputVariables) || {};
        this.outputVariables = (properties && properties.outputVariables) || {};
    }
}

module.exports = {
    McmaDeployedComponent
};