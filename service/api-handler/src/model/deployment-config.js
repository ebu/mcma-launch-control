const { Resource } = require ("@mcma/core")

class McmaDeploymentConfig extends Resource {
    constructor(config) {
        super("McmaDeploymentConfig", config)

        this.id = (config && config.id) || null;
        this.name = (config && config.name) || null;
        this.displayName = (config && config.displayName) || null;
        this.variables = (config && config.variables) || {};
    }
}

module.exports = {
    McmaDeploymentConfig
}