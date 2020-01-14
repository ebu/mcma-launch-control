import { DefaultRouteCollectionBuilder, HttpStatusCode } from "@mcma/api";
import { DynamoDbTable, DynamoDbTableProvider } from "@mcma/aws-dynamodb";
import { LambdaWorkerInvoker } from "@mcma/aws-lambda-worker-invoker";

import { McmaProject } from "@local/commons";

const URI_TEMPLATE = "/projects";

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const worker = new LambdaWorkerInvoker();

async function createProject(requestContext) {
    console.log("createProject()", JSON.stringify(requestContext.request, null, 2));

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let project = new McmaProject(requestContext.getRequestBody());

    if (!project.name) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaProject is missing the name.");
        return;
    }

    if (!project.displayName) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaProject is missing the display name.");
        return;
    }

    if (!nameRegExp.test(project.name)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaProject has illegal characters in name.");
        return;
    }

    let projectId = requestContext.publicUrl() + URI_TEMPLATE + "/" + project.name;
    project.onCreate(projectId);

    let table = new DynamoDbTable(requestContext.tableName(), McmaProject);

    let existingProject = await table.get(projectId);
    if (existingProject) {
        requestContext.setResponseStatusCode(HttpStatusCode.UnprocessableEntity, "McmaProject with name '" + project.name + "' already exists.");
        return;
    }

    project = await table.put(projectId, project);

    requestContext.setResponseResourceCreated(project);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "createProject",
        requestContext.getAllContextVariables(),
        { projectId });

    console.log("createProject()", JSON.stringify(requestContext.response, null, 2));
}

async function updateProject(requestContext) {
    console.log("updateProject()", JSON.stringify(requestContext.request, null, 2));

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let projectName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(projectName)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaProject has illegal characters in name.");
        return;
    }

    let projectId = requestContext.publicUrl() + requestContext.request.path;

    let project = new McmaProject(requestContext.getRequestBody());
    project.name = projectName;
    project.onUpsert(projectId);

    let table = new DynamoDbTable(requestContext.tableName(), McmaProject);
    project = await table.put(projectId, project);

    requestContext.setResponseBody(project);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "CreateProject",
        requestContext.getAllContextVariables(),
        { projectId });

    console.log("updateProject()", JSON.stringify(requestContext.response, null, 2));
}

async function onBeforeDeleteProject(requestContext) {
    console.log(requestContext);
    // TODO check if project has deployments or components

    return true;
}

async function onAfterDeleteProject(requestContext, resource) {
    let projectName = resource.name;

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "DeleteProject",
        requestContext.getAllContextVariables(),
        { projectName });

    return resource;
}

export const projectRoutes = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaProject), McmaProject, URI_TEMPLATE)
    .addAll()
    .route(r => r.create).configure(r => r.overrideHandler(createProject))
    .route(r => r.update).configure(r => r.overrideHandler(updateProject))
    .route(r => r.delete).configure(r => {
        r.onStarted(onBeforeDeleteProject);
        r.onCompleted(onAfterDeleteProject);
    })
    .build();
