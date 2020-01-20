const { McmaProvider } = require("./provider");
const { Resource } = require("@mcma/core");

class McmaProject extends Resource {
    constructor(properties) {
        super("McmaProject", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.name = (properties && properties.name) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.variables = (properties && properties.variables) || {};
        this.providers = (properties && properties.providers) || [];

        this.providers = this.providers.map(p => new McmaProvider(p));
    }
}

module.exports = {
    McmaProject,
};
