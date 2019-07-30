
const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");

const { McmaDeploymentConfig } = require("../model/deployment-config");

const URI_TEMPLATE = "/deployment-configs"

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const createMcmaDeploymentConfig = async (requestContext) => {
    Logger.info("createMcmaDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));

    let deploymentConfig = requestContext.isBadRequestDueToMissingBody()
    if (!deploymentConfig) {
        return;
    }

    if (!nameRegExp.test(deploymentConfig.name)) {
        requestContext.response.statusCode = HttpStatusCode.BAD_REQUEST;
        requestContext.response.statusMessage = "McmaDeploymentConfig has illegal characters in name.";
        return;
    }

    deploymentConfig = new McmaDeploymentConfig(deploymentConfig);
    deploymentConfig.onCreate(requestContext.publicUrl() + URI_TEMPLATE + "/" + deploymentConfig.name)

    let table = new DynamoDbTable(McmaDeploymentConfig, requestContext.tableName());

    let existingDeploymentConfig = await table.get(deploymentConfig.id);
    if (existingDeploymentConfig) {
        requestContext.response.statusCode = 422;
        requestContext.response.statusMessage = "McmaDeploymentConfig with name '" + deploymentConfig.name + "' already exists.";
        return;
    }

    deploymentConfig = await table.put(deploymentConfig.id, deploymentConfig);

    requestContext.resourceCreated(deploymentConfig);

    Logger.info("createMcmaDeploymentConfig()", JSON.stringify(requestContext.response, null, 2));
}

const updateMcmaDeploymentConfig = async (requestContext) => {
    Logger.info("updateMcmaDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));

    let deploymentConfigName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(deploymentConfigName)) {
        requestContext.response.statusCode = HttpStatusCode.BAD_REQUEST;
        requestContext.response.statusMessage = "McmaDeploymentConfig has illegal characters in name.";
        return;
    }

    let deploymentConfig = requestContext.isBadRequestDueToMissingBody()
    if (!deploymentConfig) {
        return;
    }

    deploymentConfig.name = deploymentConfigName;

    deploymentConfig = new McmaDeploymentConfig(deploymentConfig);
    deploymentConfig.onUpsert(requestContext.publicUrl() + requestContext.request.path);

    let table = new DynamoDbTable(McmaDeploymentConfig, requestContext.tableName());
    deploymentConfig = await table.put(deploymentConfig.id, deploymentConfig);

    requestContext.response.body = deploymentConfig;

    Logger.info("updateMcmaDeploymentConfig()", JSON.stringify(requestContext.response, null, 2));
}

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaDeploymentConfig), McmaDeploymentConfig, URI_TEMPLATE)
    .addAll()
    .route(r => r.create).configure(r => r.overrideHandler(createMcmaDeploymentConfig))
    .route(r => r.update).configure(r => r.overrideHandler(updateMcmaDeploymentConfig))
    .build();

module.exports = routeCollection;