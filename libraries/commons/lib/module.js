const { Resource } = require("@mcma/core");

class McmaModule extends Resource {
    constructor(properties) {
        super("McmaModule", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.namespace = (properties && properties.namespace) || null;
        this.name = (properties && properties.name) || null;
        this.provider = (properties && properties.provider) || null;
        this.version = (properties && properties.version) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.description = (properties && properties.description) || null;
        this.link = (properties && properties.link) || null;
        this.providers = properties && properties.providers;
        this.inputParameters = properties && properties.inputParameters;
        this.outputParameters = properties && properties.outputParameters;
        this.deploymentActions = properties && properties.deploymentActions;

        if (!Array.isArray(this.providers)) {
            this.providers = [];
        }
        if (!Array.isArray(this.inputParameters)) {
            this.inputParameters = [];
        }
        if (!Array.isArray(this.outputParameters)) {
            this.outputParameters = [];
        }
        if (!Array.isArray(this.deploymentActions)) {
            this.deploymentActions = [];
        }

        this.inputParameters = this.inputParameters.map(v => new McmaModuleParameter(v));
        this.outputParameters = this.outputParameters.map(v => new McmaModuleParameter(v));
        this.deploymentActions = this.deploymentActions.map(v => new McmaModuleDeploymentAction(v));
    }
}

class McmaModuleParameter {
    constructor(properties) {
        this.name = (properties && properties.name) || null;
        this.description = (properties && properties.description) || null;
        this.type = (properties && properties.type) || null;
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
