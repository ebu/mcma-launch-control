const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");
const { LambdaWorkerInvoker } = require("@mcma/aws-lambda-worker-invoker");

const { McmaDeployment, McmaDeploymentStatus } = require("commons");
const { DataController } = require("data");

const PROJECTS_PATH = "/projects";
const DEPLOYMENTS_PATH = "/deployments";
const DEPLOYMENTS_CONFIG_PATH = "/deployment-configs";
const URI_TEMPLATE = PROJECTS_PATH + "/{projectId}" + DEPLOYMENTS_PATH;
const URI_TEMPLATE_2 = URI_TEMPLATE + "/{deploymentId}";

const worker = new LambdaWorkerInvoker();

const queryDeployment = async (requestContext) => {
    Logger.info("queryDeployment()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
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
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let deploymentName = requestContext.request.pathVariables.deploymentId;
    let deploymentConfigId = requestContext.publicUrl() + DEPLOYMENTS_CONFIG_PATH + "/" + deploymentName;
    let deploymentConfig = await dc.getDeploymentConfig(deploymentConfigId);
    if (!deploymentConfig) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaDeploymentConfig '" + deploymentConfigId + "' does not exist.");
        return;
    }

    let deploymentId = requestContext.publicUrl() + requestContext.request.path;
    let deployment = await dc.getDeployment(deploymentId);
    if (deployment) {
        if (deployment.status === McmaDeploymentStatus.DEPLOYING || deployment.status === McmaDeploymentStatus.DESTROYING) {
            requestContext.setResponseStatusCode(HttpStatusCode.CONFLICT, "McmaDeployment '" + deploymentId + "' is in " + deployment.status + " state. Try again later");
            return;
        }
    } else {
        deployment = new McmaDeployment();
        deployment.project = projectId;
        deployment.config = deploymentConfigId;
    }

    deployment.status = McmaDeploymentStatus.DEPLOYING;
    deployment.statusMessage = null;
    deployment.onUpsert(deploymentId);

    deployment = await dc.setDeployment(deployment);

    requestContext.setResponseBody(deployment);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "updateDeployment",
        requestContext.getAllContextVariables(),
        { projectId, deploymentConfigId, deploymentId });

    Logger.info("updateDeployment()", JSON.stringify(requestContext.response, null, 2));
};

const deleteDeployment = async (requestContext) => {
    Logger.info("deleteDeployment()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let deploymentName = requestContext.request.pathVariables.deploymentId;
    let deploymentConfigId = requestContext.publicUrl() + DEPLOYMENTS_CONFIG_PATH + "/" + deploymentName;
    let deploymentConfig = await dc.getDeploymentConfig(deploymentConfigId);
    if (!deploymentConfig) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaDeploymentConfig '" + deploymentConfigId + "' does not exist.");
        return;
    }

    let deploymentId = requestContext.publicUrl() + requestContext.request.path;
    let deployment = await dc.getDeployment(deploymentId);
    if (!deployment) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaDeployment '" + deploymentId + "' does not exist.");
        return;
    }

    if (deployment.status === McmaDeploymentStatus.DEPLOYING || deployment.status === McmaDeploymentStatus.DESTROYING) {
        requestContext.setResponseStatusCode(HttpStatusCode.CONFLICT, "McmaDeployment '" + deploymentId + "' is in " + deployment.status + " state. Try again later");
        return;
    }

    deployment.status = McmaDeploymentStatus.DESTROYING;
    deployment.statusMessage = null;
    deployment.onUpsert(deploymentId);

    await dc.setDeployment(deployment);

    requestContext.setResponseStatusCode(HttpStatusCode.ACCEPTED);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "deleteDeployment",
        requestContext.getAllContextVariables(),
        { projectId, deploymentConfigId, deploymentId });

    Logger.info("deleteDeployment()", JSON.stringify(requestContext.response, null, 2));
};

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaDeployment), McmaDeployment, URI_TEMPLATE)
    .route(r => r.get).add()
    .build()
    .addRoute("GET", URI_TEMPLATE, queryDeployment)
    .addRoute("POST", URI_TEMPLATE_2, updateDeployment)
    .addRoute("DELETE", URI_TEMPLATE_2, deleteDeployment);

module.exports = routeCollection;
