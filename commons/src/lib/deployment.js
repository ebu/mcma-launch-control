const { Resource } = require("@mcma/core");

class McmaDeployment extends Resource {
    constructor(config) {
        super("McmaDeployment", config);

        this.dateCreated = (config && config.dateCreated) || null;
        this.dateModified = (config && config.dateModified) || null;

        this.id = (config && config.id) || null;
        this.mcmaDeploymentConfig = (config && config.mcmaDeploymentConfig) || null;
        this.status = (config && config.status) || null;
        this.statusMessage = (config && config.statusMessage) || null;
        this.projectName = (config && config.projectName);
        this.variables = (config && config.variables) || {};
    }
}

module.exports = {
    McmaDeployment
};