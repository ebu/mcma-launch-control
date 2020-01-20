import { DefaultRouteCollectionBuilder, HttpStatusCode } from "@mcma/api";
import { DynamoDbTableProvider } from "@mcma/aws-dynamodb";
import { McmaDeployedComponent } from "@local/commons";
import { DataController } from "@local/data";

const PROJECTS_PATH = "/projects";
const DEPLOYMENTS_PATH = "/deployments";
const DEPLOYED_COMPONENTS_PATH = "/components";
const URI_TEMPLATE = PROJECTS_PATH + "/{projectId}" + DEPLOYMENTS_PATH + "/{deploymentId}" + DEPLOYED_COMPONENTS_PATH;

async function queryDeployedComponent(requestContext) {
    console.log("queryDeployedComponent()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let deploymentId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId + DEPLOYMENTS_PATH + "/" + requestContext.request.pathVariables.deploymentId;
    let deployment = await dc.getDeployment(deploymentId);
    if (!deployment) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaDeployment '" + deploymentId + "' does not exist.");
        return;
    }

    let resources = await dc.getDeployedComponents(deploymentId);
    requestContext.setResponseBody(resources);

    console.log("queryDeployedComponent()", JSON.stringify(requestContext.response, null, 2));
}

export const deployedComponentRoutes = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaDeployedComponent), McmaDeployedComponent, URI_TEMPLATE)
    .route(r => r.get).add()
    .build()
    .addRoute("GET", URI_TEMPLATE, queryDeployedComponent);
