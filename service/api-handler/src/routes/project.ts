import { DefaultRouteCollectionBuilder, HttpStatusCode } from "@mcma/api";
import { DynamoDbTableProvider } from "@mcma/aws-dynamodb";
import { LambdaWorkerInvoker } from "@mcma/aws-lambda-worker-invoker";
import { McmaProject } from "@local/commons";
import { DataController } from "@local/data";

const URI_TEMPLATE = "/projects";

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const worker = new LambdaWorkerInvoker();

async function createProject(requestContext) {
    console.log("createProject()", JSON.stringify(requestContext.request, null, 2));
    const dc = new DataController(requestContext.tableName());

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

    const projectId = requestContext.publicUrl() + URI_TEMPLATE + "/" + project.name;
    project.onCreate(projectId);

    let existingProject = await dc.getProject(projectId);
    if (existingProject) {
        requestContext.setResponseStatusCode(HttpStatusCode.UnprocessableEntity, "McmaProject with name '" + project.name + "' already exists.");
        return;
    }

    project = await dc.setProject(project);
    requestContext.setResponseResourceCreated(project);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "CreateProject",
        requestContext.getAllContextVariables(),
        { projectId });

    console.log("createProject()", JSON.stringify(requestContext.response, null, 2));
}

async function updateProject(requestContext) {
    console.log("updateProject()", JSON.stringify(requestContext.request, null, 2));
    const dc = new DataController(requestContext.tableName());

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    const projectName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(projectName)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaProject has illegal characters in name.");
        return;
    }

    const projectId = requestContext.publicUrl() + requestContext.request.path;

    let project = new McmaProject(requestContext.getRequestBody());
    project.name = projectName;
    project.onUpsert(projectId);

    project = await dc.setProject(project);
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
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + requestContext.request.path;

    const deployments = await dc.getDeployments(projectId);
    if (deployments.length > 0) {
        requestContext.setResponseStatusCode(HttpStatusCode.Conflict, "Unable to delete project if there are still active deployments");
        return false;
    }

    const components = await dc.getComponents(projectId);
    for (const component of components) {
        await dc.deleteComponent(component.id);
    }

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
