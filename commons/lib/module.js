const { Resource } = require("@mcma/core");

class McmaModule extends Resource {
    constructor(properties) {
        super("McmaModule", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.provider = (properties && properties.provider) || null;
        this.name = (properties && properties.name) || null;
        this.version = (properties && properties.version) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.description = (properties && properties.description) || null;
        this.inputParameters = (properties && properties.inputParameters) || [];
        this.outputParameters = (properties && properties.outputParameters) || [];

        this.inputParameters = this.inputParameters.map(param => new McmaModuleParameter(param));
        this.outputParameters = this.outputParameters.map(param => new McmaModuleParameter(param));
    }
}

class McmaModuleParameter {
    constructor(properties) {
        this.name = (properties && properties.name) || null;
        this.type = (properties && properties.type) || null;
    }
}

module.exports = {
    McmaModule,
    McmaModuleParameter,
};
