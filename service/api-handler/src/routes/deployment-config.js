//"use strict";

const { McmaApiRouteCollection, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable } = require("@mcma/aws-dynamodb");

const { DeploymentConfig } = require("../model/deployment-config");

const DEPLOYMENT_CONFIGS = "/deployment-configs"

const getDeploymentConfigs = async (requestContext) => {
    console.log("getDeploymentConfigs()", JSON.stringify(requestContext.request, null, 2));

    let table = new DynamoDbTable(DeploymentConfig, requestContext.tableName());

    let items = await table.query();

    requestContext.resourceIfFound(items);

    console.log(JSON.stringify(requestContext.response, null, 2));
}

const addDeploymentConfig = async (requestContext) => {
    console.log("addDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));

    // let deploymentConfig = requestContext.getRequestBody(); // throws new BadRequestError("Missing request body.") if no body is present
    let deploymentConfig = requestContext.isBadRequestDueToMissingBody()
    if (!deploymentConfig) {
        return;
    }

    if (!/[0-9a-zA-Z\-]/.test(deploymentConfig.name)) {
        // throw new BadRequestError("DeploymentConfig has illegal characters in name");
        requestContext.response.statusCode = HttpStatusCode.BAD_REQUEST;
        requestContext.response.statusMessage = "DeploymentConfig has illegal characters in name";
        return;
    }

    deploymentConfig = new DeploymentConfig(deploymentConfig);
    deploymentConfig.onCreate(requestContext.publicUrl() + DEPLOYMENT_CONFIGS + "/" + deploymentConfig.name)

    let table = new DynamoDbTable(DeploymentConfig, requestContext.tableName());
    await table.put(deploymentConfig.id, deploymentConfig);

    // requestContext.setResponseHeader("Location", deploymentConfig.id);
    // requestContext.setResponseCode(HttpStatusCode.CREATED);
    // requestContext.setResponseBody(deploymentConfig);
    
    requestContext.resourceCreated(deploymentConfig);

    console.log("addDeploymentConfig()", JSON.stringify(requestContext.response, null, 2));
}

const getDeploymentConfig = async (requestContext) => {
    console.log("getDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));

    let table = new DynamoDbTable(DeploymentConfig, requestContext.tableName());
    let deploymentConfig = await table.get(requestContext.publicUrl() + requestContext.request.path);

    requestContext.resourceIfFound(deploymentConfig);

    console.log(JSON.stringify(requestContext.response, null, 2));
}

const putDeploymentConfig = async (requestContext) => {
    console.log("putDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));

    let deploymentConfigName = requestContext.request.pathVariables.name;

    if (!/[0-9a-zA-Z\-]/.test(deploymentConfigName)) {
        requestContext.response.statusCode = HttpStatusCode.BAD_REQUEST;
        requestContext.response.statusMessage = "DeploymentConfig has illegal characters in name";
        return;
    }

    let deploymentConfig = requestContext.isBadRequestDueToMissingBody()
    if (!deploymentConfig) {
        return;
    }

    deploymentConfig.name = deploymentConfigName;

    deploymentConfig = new DeploymentConfig(deploymentConfig);
    deploymentConfig.onUpsert(requestContext.publicUrl() + requestContext.request.path);

    let table = new DynamoDbTable(DeploymentConfig, requestContext.tableName());
    await table.put(deploymentConfig.id, deploymentConfig);

    requestContext.response.body = deploymentConfig;

    console.log(JSON.stringify(requestContext.response, null, 2));
}

const deleteDeploymentConfig = async (requestContext) => {
    console.log("deleteDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));

    let table = new DynamoDbTable(DeploymentConfig, requestContext.tableName());
    let deploymentConfig = await table.get(requestContext.publicUrl() + requestContext.request.path);

    if (!deploymentConfig) {
        // throw new NotFoundError();
        requestContext.response.statusCode = HttpStatusCode.NOT_FOUND;
        requestContext.response.statusMessage = "No resource found on path '" + requestContext.request.path + "'.";
        return;
    }

    await table.delete(deploymentConfig.id);
}

const routeCollection = new McmaApiRouteCollection();
routeCollection.addRoute("GET", DEPLOYMENT_CONFIGS, getDeploymentConfigs);
routeCollection.addRoute("POST", DEPLOYMENT_CONFIGS, addDeploymentConfig);
routeCollection.addRoute("GET", DEPLOYMENT_CONFIGS + "/{name}", getDeploymentConfig);
routeCollection.addRoute("PUT", DEPLOYMENT_CONFIGS + "/{name}", putDeploymentConfig);
routeCollection.addRoute("DELETE", DEPLOYMENT_CONFIGS + "/{name}", deleteDeploymentConfig);

module.exports = routeCollection;