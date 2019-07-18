const { Resource } = require ("@mcma/core")

class DeploymentConfig extends Resource {
    constructor(config) {
        super("DeploymentConfig", config)

        this.id = (config && config.id) || null;
        this.name = (config && config.name) || null;
        this.displayName = (config && config.displayName) || null;
        this.variables = (config && config.variables) || {};
    }
}

module.exports = {
    DeploymentConfig
}