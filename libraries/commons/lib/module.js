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
        this.link = (properties && properties.link) || null;
        this.inputParameters = (properties && properties.inputParameters) || [];
        this.outputParameters = (properties && properties.outputParameters) || [];
        this.postDeploymentActions = (properties && properties.postDeploymentActions) || [];

        this.inputParameters = this.inputParameters.map(param => new McmaModuleParameter(param));
        this.outputParameters = this.outputParameters.map(param => new McmaModuleParameter(param));
        this.postDeploymentActions = this.postDeploymentActions.map(param => new McmaModuleAction(param));
    }
}

class McmaModuleParameter {
    constructor(properties) {
        this.name = (properties && properties.name) || null;
        this.type = (properties && properties.type) || null;
        this.defaultValue = (properties && properties.defaultValue) || null;
    }
}

const McmaModuleActionType = Object.freeze({
    CreateResource: "CreateResource",
});

class McmaModuleAction {
    constructor(properties) {
        this.type = (properties && properties.type) || null;
        this.data = (properties && properties.data) || null;
    }
}

module.exports = {
    McmaModule,
    McmaModuleParameter,
    McmaModuleActionType,
    McmaModuleAction,
};
