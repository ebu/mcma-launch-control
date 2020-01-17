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
        this.deploymentActions = (properties && properties.deploymentActions) || [];

        this.inputParameters = this.inputParameters.map(param => new McmaModuleParameter(param));
        this.outputParameters = this.outputParameters.map(param => new McmaModuleParameter(param));
        this.deploymentActions = this.deploymentActions.map(param => new McmaModuleDeploymentAction(param));
    }
}

class McmaModuleParameter {
    constructor(properties) {
        this.name = (properties && properties.name) || null;
        this.type = (properties && properties.type) || null;
        this.defaultValue = (properties && properties.defaultValue) || null;
    }
}

const McmaModuleDeploymentActionType = Object.freeze({
    ManagedResource: "ManagedResource",
    RunScript: "RunScript",
});

class McmaModuleDeploymentAction {
    constructor(properties) {
        this.type = (properties && properties.type) || null;
        this.data = (properties && properties.data) || null;
    }
}

module.exports = {
    McmaModule,
    McmaModuleParameter,
    McmaModuleDeploymentActionType,
    McmaModuleDeploymentAction,
};
