const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");
const { LambdaWorkerInvoker } = require("@mcma/aws-lambda-worker-invoker");

const { McmaDeployment, McmaDeploymentConfig, McmaDeploymentStatus, McmaProject } = require("commons");

const PROJECTS_PATH = "/projects";
const DEPLOYMENTS_PATH = "/deployments";
const DEPLOYMENTS_CONFIG_PATH = "/deployment-configs";
const URI_TEMPLATE = PROJECTS_PATH + "/{projectId}" + DEPLOYMENTS_PATH;
const URI_TEMPLATE_2 = URI_TEMPLATE + "/{deploymentId}";

const worker = new LambdaWorkerInvoker();

const queryDeployment = async (requestContext) => {
    Logger.info("queryDeployment()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let deploymentTable = new DynamoDbTable(McmaDeployment, requestContext.tableName());
    let resources = await deploymentTable.query((resource) => resource.id.startsWith(projectId));

    requestContext.setResponseBody(resources);

    Logger.info("queryDeployment()", JSON.stringify(requestContext.response, null, 2));
};

const updateDeployment = async (requestContext) => {
    Logger.info("updateDeployment()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let deploymentName = requestContext.request.pathVariables.deploymentId;

    let deploymentConfigId = requestContext.publicUrl() + DEPLOYMENTS_CONFIG_PATH + "/" + deploymentName;
    let deploymentConfigTable = new DynamoDbTable(McmaDeploymentConfig, requestContext.tableName());
    let deploymentConfig = await deploymentConfigTable.get(deploymentConfigId);
    if (!deploymentConfig) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaDeploymentConfig '" + deploymentConfigId + "' does not exist.");
        return;
    }

    let deploymentTable = new DynamoDbTable(McmaDeployment, requestContext.tableName());

    let deploymentId = requestContext.publicUrl() + requestContext.request.path;

    let deployment = await deploymentTable.get(deploymentId);
    if (deployment) {
        if (deployment.status == McmaDeploymentStatus.DEPLOYING || deployment.status == McmaDeploymentStatus.DESTROYING) {
            requestContext.setResponseStatusCode(HttpStatusCode.CONFLICT, "McmaDeployment '" + deploymentId + "' is in " + deployment.status + " state. Try again later");
            return;
        }
    }

    deployment = new McmaDeployment(deployment);
    deployment.status = McmaDeploymentStatus.DEPLOYING;
    deployment.onUpsert(deploymentId);

    deployment = await deploymentTable.put(deployment.id, deployment);

    requestContext.setResponseBody(deployment);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "updateDeployment",
        requestContext.getAllContextVariables(),
        { deploymentId });

    Logger.info("updateDeployment()", JSON.stringify(requestContext.response, null, 2));
};

const deleteDeployment = async (requestContext) => {
    Logger.info("deleteDeployment()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let deploymentName = requestContext.request.pathVariables.deploymentId;

    let deploymentConfigId = requestContext.publicUrl() + DEPLOYMENTS_CONFIG_PATH + "/" + deploymentName;
    let deploymentConfigTable = new DynamoDbTable(McmaDeploymentConfig, requestContext.tableName());
    let deploymentConfig = await deploymentConfigTable.get(deploymentConfigId);
    if (!deploymentConfig) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaDeploymentConfig '" + deploymentConfigId + "' does not exist.");
        return;
    }

    let deploymentTable = new DynamoDbTable(McmaDeployment, requestContext.tableName());

    let deploymentId = requestContext.publicUrl() + requestContext.request.path;

    let deployment = await deploymentTable.get(deploymentId);

    if (!deployment) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaDeployment '" + deploymentId + "' does not exist.");
        return;
    }

    if (deployment.status == McmaDeploymentStatus.DEPLOYING || deployment.status == McmaDeploymentStatus.DESTROYING) {
        requestContext.setResponseStatusCode(HttpStatusCode.CONFLICT, "McmaDeployment '" + deploymentId + "' is in " + deployment.status + " state. Try again later");
        return;
    }

    deployment = new McmaDeployment(deployment);
    deployment.status = McmaDeploymentStatus.DESTROYING;
    deployment.onUpsert(deploymentId);

    deployment = await deploymentTable.put(deployment.id, deployment);

    requestContext.setResponseStatusCode(HttpStatusCode.ACCEPTED);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "deleteDeployment",
        requestContext.getAllContextVariables(),
        { deploymentId });

    Logger.info("deleteDeployment()", JSON.stringify(requestContext.response, null, 2));
};

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaDeployment), McmaDeployment, URI_TEMPLATE)
    .route(r => r.get).add()
    .build()
    .addRoute("GET", URI_TEMPLATE, queryDeployment)
    .addRoute("POST", URI_TEMPLATE_2, updateDeployment)
    .addRoute("DELETE", URI_TEMPLATE_2, deleteDeployment);

module.exports = routeCollection;
