const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");
const { LambdaWorkerInvoker } = require("@mcma/aws-lambda-worker-invoker");

const { McmaProject } = require("commons");

const URI_TEMPLATE = "/projects";

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const worker = new LambdaWorkerInvoker();

const createProject = async (requestContext) => {
    Logger.info("createProject()", JSON.stringify(requestContext.request, null, 2));

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let project = new McmaProject(requestContext.getRequestBody());

    if (!project.name) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaProject is missing the name.");
        return;
    }

    if (!project.displayName) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaProject is missing the display name.");
        return;
    }

    if (!nameRegExp.test(project.name)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaProject has illegal characters in name.");
        return;
    }

    let projectId = requestContext.publicUrl() + URI_TEMPLATE + "/" + project.name;
    project.onCreate(projectId);

    let table = new DynamoDbTable(McmaProject, requestContext.tableName());

    let existingProject = await table.get(projectId);
    if (existingProject) {
        requestContext.setResponseStatusCode(HttpStatusCode.UNPROCESSABLE_ENTITY, "McmaProject with name '" + project.name + "' already exists.");
        return;
    }

    project = await table.put(projectId, project);

    requestContext.setResponseResourceCreated(project);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "createProject",
        requestContext.getAllContextVariables(),
        { projectId });

    Logger.info("createProject()", JSON.stringify(requestContext.response, null, 2));
};

const updateProject = async (requestContext) => {
    Logger.info("updateProject()", JSON.stringify(requestContext.request, null, 2));

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let projectName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(projectName)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaProject has illegal characters in name.");
        return;
    }

    let projectId = requestContext.publicUrl() + requestContext.request.path;

    let project = new McmaProject(requestContext.getRequestBody());
    project.name = projectName;
    project.onUpsert(projectId);

    let table = new DynamoDbTable(McmaProject, requestContext.tableName());
    project = await table.put(projectId, project);

    requestContext.setResponseBody(project);

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "createProject",
        requestContext.getAllContextVariables(),
        { projectId });

    Logger.info("updateProject()", JSON.stringify(requestContext.response, null, 2));
};

const onBeforeDeleteProject = async (requestContext) => {
    Logger.info(requestContext);
    // TODO check if project has deployments or components
};

const onAfterDeleteProject = async (requestContext, resource) => {
    let projectName = resource.name;

    await worker.invoke(
        process.env.ServiceWorkerLambdaFunctionName,
        "deleteProject",
        requestContext.getAllContextVariables(),
        { projectName });
};

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaProject), McmaProject, URI_TEMPLATE)
    .addAll()
    .route(r => r.create).configure(r => r.overrideHandler(createProject))
    .route(r => r.update).configure(r => r.overrideHandler(updateProject))
    .route(r => r.delete).configure(r => {
        r.onStarted(onBeforeDeleteProject);
        r.onCompleted(onAfterDeleteProject)
    })
    .build();

module.exports = routeCollection;
