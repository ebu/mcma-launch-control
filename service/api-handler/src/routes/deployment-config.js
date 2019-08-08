
const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");

const { McmaDeploymentConfig } = require("commons");

const URI_TEMPLATE = "/deployment-configs"

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const createDeploymentConfig = async (requestContext) => {
    Logger.info("createDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let deploymentConfig = new McmaDeploymentConfig(requestContext.getRequestBody());
    
    if (!nameRegExp.test(deploymentConfig.name)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaDeploymentConfig has illegal characters in name.");
        return;
    }

    deploymentConfig.onCreate(requestContext.publicUrl() + URI_TEMPLATE + "/" + deploymentConfig.name)

    let table = new DynamoDbTable(McmaDeploymentConfig, requestContext.tableName());

    let existingDeploymentConfig = await table.get(deploymentConfig.id);
    if (existingDeploymentConfig) {
        requestContext.setResponseStatusCode(HttpStatusCode.UNPROCESSABLE_ENTITY, "McmaDeploymentConfig with name '" + deploymentConfig.name + "' already exists.");
        return;
    }

    deploymentConfig = await table.put(deploymentConfig.id, deploymentConfig);

    requestContext.setResponseResourceCreated(deploymentConfig);

    Logger.info("createDeploymentConfig()", JSON.stringify(requestContext.response, null, 2));
}

const updateDeploymentConfig = async (requestContext) => {
    Logger.info("updateDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let deploymentConfigName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(deploymentConfigName)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaDeploymentConfig has illegal characters in name.");
        return;
    }

    let deploymentConfig = new McmaDeploymentConfig(requestContext.getRequestBody());

    deploymentConfig.name = deploymentConfigName;
    deploymentConfig.onUpsert(requestContext.publicUrl() + requestContext.request.path);

    let table = new DynamoDbTable(McmaDeploymentConfig, requestContext.tableName());
    deploymentConfig = await table.put(deploymentConfig.id, deploymentConfig);

    requestContext.setResponseBody(deploymentConfig);

    Logger.info("updateDeploymentConfig()", JSON.stringify(requestContext.response, null, 2));
}

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaDeploymentConfig), McmaDeploymentConfig, URI_TEMPLATE)
    .addAll()
    .route(r => r.create).configure(r => r.overrideHandler(createDeploymentConfig))
    .route(r => r.update).configure(r => r.overrideHandler(updateDeploymentConfig))
    .build();

module.exports = routeCollection;
