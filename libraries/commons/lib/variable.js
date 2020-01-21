const { McmaObject } = require("@mcma/core");

class McmaVariable extends McmaObject {
    constructor(properties) {
        super("McmaVariable", properties);

        this.name = (properties && properties.name) || "";
        this.value = (properties && properties.value) || "";
        this.secure = (properties && properties.secure) || false;
    }
}

module.exports = {
    McmaVariable,
};
