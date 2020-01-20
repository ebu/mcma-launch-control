import { DefaultRouteCollectionBuilder, HttpStatusCode } from "@mcma/api";
import { DynamoDbTableProvider } from "@mcma/aws-dynamodb";
import { LambdaWorkerInvoker } from "@mcma/aws-lambda-worker-invoker";
import { McmaDeployment, McmaDeploymentStatus } from "@local/commons";
import { DataController } from "@local/data";

const PROJECTS_PATH = "/projects";
const DEPLOYMENTS_PATH = "/deployments";
const DEPLOYMENTS_CONFIG_PATH = "/deployment-configs";
const URI_TEMPLATE = PROJECTS_PATH + "/{projectId}" + DEPLOYMENTS_PATH;
const URI_TEMPLATE_2 = URI_TEMPLATE + "/{deploymentId}";

const worker = new LambdaWorkerInvoker();

const queryDeployment = async (requestContext) => {
    console.log("queryDeployment()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let resources = await dc.getDeployments(projectId);
    requestContext.setResponseBody(resources);

    console.log("queryDeployment()", JSON.stringify(requestContext.response, null, 2));
};

const updateDeployment = async (requestContext) => {
    console.log("updateDeployment()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let deploymentName = requestContext.request.pathVariables.deploymentId;
    let deploymentConfigId = requestContext.publicUrl() + DEPLOYMENTS_CONFIG_PATH + "/" + deploymentName;
    let deploymentConfig = await dc.getDeploymentConfig(deploymentConfigId);
    if (!deploymentConfig) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaDeploymentConfig '" + deploymentConfigId + "' does not exist.");
        return;
    }

    let deploymentId = requestContext.publicUrl() + requestContext.request.path;
    let deployment = await dc.getDeployment(deploymentId);
    if (deployment) {
        if (deployment.status === McmaDeploymentStatus.Deploying || deployment.status === McmaDeploymentStatus.Destroying) {
            requestContext.setResponseStatusCode(HttpStatusCode.Conflict, "McmaDeployment '" + deploymentId + "' is in " + deployment.status + " state. Try again later");
            return;
        }
    } else {
        deployment = new McmaDeployment();
        deployment.project = projectId;
        deployment.config = deploymentConfigId;
    }

    deployment.status = McmaDeploymentStatus.Deploying;
    deployment.statusMessage = null;
    deployment.onUpsert(deploymentId);

    deployment = await dc.setDeployment(deployment);

    requestContext.setResponseBody(deployment);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "UpdateDeployment",
        requestContext.getAllContextVariables(),
        { projectId, deploymentConfigId, deploymentId });

    console.log("updateDeployment()", JSON.stringify(requestContext.response, null, 2));
};

const deleteDeployment = async (requestContext) => {
    console.log("deleteDeployment()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let deploymentName = requestContext.request.pathVariables.deploymentId;
    let deploymentConfigId = requestContext.publicUrl() + DEPLOYMENTS_CONFIG_PATH + "/" + deploymentName;
    let deploymentConfig = await dc.getDeploymentConfig(deploymentConfigId);
    if (!deploymentConfig) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaDeploymentConfig '" + deploymentConfigId + "' does not exist.");
        return;
    }

    let deploymentId = requestContext.publicUrl() + requestContext.request.path;
    let deployment = await dc.getDeployment(deploymentId);
    if (!deployment) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaDeployment '" + deploymentId + "' does not exist.");
        return;
    }

    if (deployment.status === McmaDeploymentStatus.Deploying || deployment.status === McmaDeploymentStatus.Destroying) {
        requestContext.setResponseStatusCode(HttpStatusCode.Conflict, "McmaDeployment '" + deploymentId + "' is in " + deployment.status + " state. Try again later");
        return;
    }

    deployment.status = McmaDeploymentStatus.Destroying;
    deployment.statusMessage = null;
    deployment.onUpsert(deploymentId);

    await dc.setDeployment(deployment);

    requestContext.setResponseStatusCode(HttpStatusCode.Accepted);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "DeleteDeployment",
        requestContext.getAllContextVariables(),
        { projectId, deploymentConfigId, deploymentId });

    console.log("deleteDeployment()", JSON.stringify(requestContext.response, null, 2));
};

export const deploymentRoutes = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaDeployment), McmaDeployment, URI_TEMPLATE)
    .route(r => r.get).add()
    .build()
    .addRoute("GET", URI_TEMPLATE, queryDeployment)
    .addRoute("POST", URI_TEMPLATE_2, updateDeployment)
    .addRoute("DELETE", URI_TEMPLATE_2, deleteDeployment);
