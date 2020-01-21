const { McmaObject } = require("@mcma/core");
const { McmaVariable } = require("./variable");

const McmaProviderType = Object.freeze({
    AWS: "aws",
    AzureRM: "azurerm",
    AzureAD: "azuread",
    Google: "google",
});

class McmaProvider extends McmaObject {
    constructor(properties) {
        super("McmaProvider", properties);

        this.name = (properties && properties.name) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.type = (properties && properties.type) || null;
        this.variables = properties && properties.variables;

        if (!Array.isArray(this.variables)) {
            this.variables = [];
        }

        this.variables = this.variables.map(v => new McmaVariable(v));
    }
}

module.exports = {
    McmaProviderType,
    McmaProvider,
};
