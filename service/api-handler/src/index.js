//"use strict";

const { McmaApiRouteCollection } = require("@mcma/api");
const { } = require("@mcma/aws-api-gateway")
const deploymentConfigRoutes = require("./routes/deployment-config");

const routeCollection = new McmaApiRouteCollection();
routeCollection.addRoutes(deploymentConfigRoutes);

const restController = routeCollection.toApiGatewayApiController();

exports.handler = async (event, context) => {
    console.log(JSON.stringify(event, null, 2), JSON.stringify(context, null, 2));

    return await restController.handleRequest(event, context);
}
