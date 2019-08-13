//"use strict";

const { McmaApiRouteCollection } = require("@mcma/api");
const {} = require("@mcma/aws-api-gateway")
const deploymentConfigRoutes = require("./routes/deployment-config");
const projectRoutes = require("./routes/project");
const componentRoutes = require("./routes/component");
const deploymentRoutes = require("./routes/deployment");
const deployedComponentRoutes = require("./routes/deployed-component");

const restController = new McmaApiRouteCollection()
    .addRoutes(deploymentConfigRoutes)
    .addRoutes(projectRoutes)
    .addRoutes(componentRoutes)
    .addRoutes(deploymentRoutes)
    .addRoutes(deployedComponentRoutes)
    .toApiGatewayApiController();

exports.handler = async (event, context) => {
    console.log(JSON.stringify(event, null, 2), JSON.stringify(context, null, 2));

    return await restController.handleRequest(event, context);
};
