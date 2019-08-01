const { Resource } = require ("@mcma/core")

class McmaDeployedComponent extends Resource {
    constructor(config) {
        super("McmaDeployedComponent", config)

        this.dateCreated = (config && config.dateCreated) || null;
        this.dateModified = (config && config.dateModified) || null;

        this.id = (config && config.id) || null;
        this.name = (config && config.name) || null;
        this.displayName = (config && config.displayName) || null;
        this.mcmaModule = (config && config.mcmaModule) || null;
        this.inputVariables = (config && config.inputVariables) || {};
        this.outputVariables = (config && config.outputVariables) || {};
    }
}

module.exports = {
    McmaDeployedComponent
}