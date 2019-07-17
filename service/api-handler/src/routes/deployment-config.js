//"use strict";

const { McmaApiRouteCollection, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable } = require("@mcma/aws-dynamodb");

const { DeploymentConfig } = require("../model/deployment-config");

const ROOT = "/deployment-configs"

const getDeploymentConfigs = async (requestContext) => {
    console.log("getDeploymentConfigs()", JSON.stringify(requestContext.request, null, 2));

    let table = new DynamoDbTable(DeploymentConfig, requestContext.tableName());

    let items = await table.query();

    requestContext.resourceIfFound(items);

    console.log(JSON.stringify(requestContext.response, null, 2));
}

const addDeploymentConfig = async (requestContext) => {
    console.log("addDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));

    let deploymentConfig = requestContext.isBadRequestDueToMissingBody()
    if (!deploymentConfig) {
        return;
    }

    if (!/[0-9a-zA-Z\-]/.test(deploymentConfig.name)) {
        requestContext.response.statusCode = HttpStatusCode.BAD_REQUEST;
        requestContext.response.statusMessage = "DeploymentConfig has illegal characters in name";
        return;
    }

    deploymentConfig = new DeploymentConfig(deploymentConfig);
    deploymentConfig.onCreate(requestContext.publicUrl() + ROOT + "/" + deploymentConfig.name)

    let table = new DynamoDbTable(DeploymentConfig, requestContext.tableName());
    await table.put(deploymentConfig.id, deploymentConfig);
    
    requestContext.resourceCreated(deploymentConfig);

    console.log("addDeploymentConfig()", JSON.stringify(requestContext.response, null, 2));
}

const routeCollection = new McmaApiRouteCollection();
routeCollection.addRoute("GET", ROOT, getDeploymentConfigs);
routeCollection.addRoute("POST", ROOT, addDeploymentConfig);

module.exports = routeCollection;