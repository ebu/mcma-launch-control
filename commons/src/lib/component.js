const { Resource } = require ("@mcma/core")

class McmaComponent extends Resource {
    constructor(config) {
        super("McmaComponent", config)

        this.dateCreated = (config && config.dateCreated) || null;
        this.dateModified = (config && config.dateModified) || null;

        this.id = (config && config.id) || null;
        this.name = (config && config.name) || null;
        this.displayName = (config && config.displayName) || null;
        this.mcmaModule = (config && config.mcmaModule) || null;
        this.variables = (config && config.variables) || {};
    }
}

module.exports = {
    McmaComponent
}