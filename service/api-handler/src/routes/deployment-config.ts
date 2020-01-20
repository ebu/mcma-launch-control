import { DefaultRouteCollectionBuilder, HttpStatusCode } from "@mcma/api";
import { DynamoDbTableProvider } from "@mcma/aws-dynamodb";
import { McmaDeploymentConfig } from "@local/commons";
import { DataController } from "@local/data";

const URI_TEMPLATE = "/deployment-configs";

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

async function createDeploymentConfig(requestContext) {
    console.log("createDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let deploymentConfig = new McmaDeploymentConfig(requestContext.getRequestBody());

    if (!deploymentConfig.name) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaDeploymentConfig is missing the name.");
        return;
    }

    if (!deploymentConfig.displayName) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaDeploymentConfig is missing the display name.");
        return;
    }

    if (!nameRegExp.test(deploymentConfig.name)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaDeploymentConfig has illegal characters in name.");
        return;
    }

    deploymentConfig.onCreate(requestContext.publicUrl() + URI_TEMPLATE + "/" + deploymentConfig.name);

    let existingDeploymentConfig = await dc.getDeploymentConfig(deploymentConfig.id);
    if (existingDeploymentConfig) {
        requestContext.setResponseStatusCode(HttpStatusCode.UnprocessableEntity, "McmaDeploymentConfig with name '" + deploymentConfig.name + "' already exists.");
        return;
    }

    deploymentConfig = await dc.setDeploymentConfig(deploymentConfig);
    requestContext.setResponseResourceCreated(deploymentConfig);

    console.log("createDeploymentConfig()", JSON.stringify(requestContext.response, null, 2));
}

async function updateDeploymentConfig(requestContext) {
    console.log("updateDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let deploymentConfigName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(deploymentConfigName)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaDeploymentConfig has illegal characters in name.");
        return;
    }

    let deploymentConfig = new McmaDeploymentConfig(requestContext.getRequestBody());

    deploymentConfig.name = deploymentConfigName;
    deploymentConfig.onUpsert(requestContext.publicUrl() + requestContext.request.path);

    deploymentConfig = await dc.setDeploymentConfig(deploymentConfig);
    requestContext.setResponseBody(deploymentConfig);

    console.log("updateDeploymentConfig()", JSON.stringify(requestContext.response, null, 2));
}

async function onBeforeDeleteDeploymentConfig(requestContext) {
    console.log("onBeforeDeleteDeploymentConfig()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    const deploymentConfigId = requestContext.publicUrl() + requestContext.request.path;

    const projects = await dc.getProjects();
    for (const project of projects) {
        const deployments = await dc.getDeployments(project.id);
        for (const deployment of deployments) {
            if (deployment.config === deploymentConfigId) {
                requestContext.setResponseStatusCode(HttpStatusCode.Conflict, "Unable to delete deploymentConfig if there are still active deployments");
                return false;
            }
        }
    }

    return true;
}

export const deploymentConfigRoutes = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaDeploymentConfig), McmaDeploymentConfig, URI_TEMPLATE)
    .addAll()
    .route(r => r.create).configure(r => r.overrideHandler(createDeploymentConfig))
    .route(r => r.update).configure(r => r.overrideHandler(updateDeploymentConfig))
    .route(r => r.delete).configure(r => {
        r.onStarted(onBeforeDeleteDeploymentConfig);
    })
    .build();
