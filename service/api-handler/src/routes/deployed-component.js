const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");

const { McmaDeployedComponent, McmaDeployment, McmaProject } = require("commons");

const PROJECTS_PATH = "/projects";
const DEPLOYMENTS_PATH = "/deployments";
const DEPLOYED_COMPONENTS_PATH = "/components";
const URI_TEMPLATE = PROJECTS_PATH + "/{projectId}" + DEPLOYMENTS_PATH + "/{deploymentId}" + DEPLOYED_COMPONENTS_PATH;

const queryDeployedComponent = async (requestContext) => {
    Logger.info("queryDeployedComponent()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let deploymentId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId + DEPLOYMENTS_PATH + "/" + requestContext.request.pathVariables.deploymentId;
    let deploymentTable = new DynamoDbTable(McmaDeployment, requestContext.tableName());
    let deployment = await deploymentTable.get(deploymentId);
    if (!deployment) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaDeployment '" + deploymentId + "' does not exist.");
        return;
    }

    let deployedComponentTable = new DynamoDbTable(McmaDeployedComponent, requestContext.tableName())
    let resources = await deployedComponentTable.query((resource) => resource.id.startsWith(deploymentId));

    requestContext.setResponseBody(resources);

    Logger.info("queryDeployedComponent()", JSON.stringify(requestContext.response, null, 2));
};

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaDeployedComponent), McmaDeployment, URI_TEMPLATE)
    .route(r => r.get).add()
    .build()
    .addRoute("GET", URI_TEMPLATE, queryDeployedComponent);

module.exports = routeCollection;
