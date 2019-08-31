const { Resource } = require("@mcma/core");

class McmaComponent extends Resource {
    constructor(properties) {
        super("McmaComponent", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.name = (properties && properties.name) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.mcmaModule = (properties && properties.mcmaModule) || null;
        this.variables = (properties && properties.variables) || {};
    }
}

module.exports = {
    McmaComponent
};