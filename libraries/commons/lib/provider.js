const { Resource } = require("@mcma/core");

const McmaProviderType = Object.freeze({
    AWS: "aws",
    AzureRM: "azurerm",
    AzureAD: "azuread",
    Google: "google",
});

class McmaProvider extends Resource {
    constructor(properties) {
        super("McmaProvider", properties);

        this.dateCreated = (properties && properties.dateCreated) || null;
        this.dateModified = (properties && properties.dateModified) || null;

        this.id = (properties && properties.id) || null;
        this.name = (properties && properties.name) || null;
        this.displayName = (properties && properties.displayName) || null;
        this.providerType = (properties && properties.providerType) || null;
        this.variables = (properties && properties.variables) || {};
    }
}

module.exports = {
    McmaProviderType,
    McmaProvider,
};
