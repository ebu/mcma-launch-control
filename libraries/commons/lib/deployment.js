const { Resource } = require("@mcma/core");

const McmaDeploymentStatus = {
    OK: "OK",
    Error: "Error",
    Deploying: "Deploying",
    Destroying: "Destroying"
};

class McmaDeployment extends Resource {
    constructor(properties) {
        super("McmaDeployment", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.project = (properties && properties.project) || null;
        this.config = (properties && properties.config) || null;
        this.status = (properties && properties.status) || null;
        this.statusMessage = (properties && properties.statusMessage) || null;
        this.variables = (properties && properties.variables) || {};
    }
}

module.exports = {
    McmaDeployment,
    McmaDeploymentStatus,
};
