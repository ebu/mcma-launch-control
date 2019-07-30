
const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");

const { McmaProject } = require("../model/project");

const URI_TEMPLATE = "/projects"

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const createMcmaProject = async (requestContext) => {
    Logger.info("createMcmaProject()", JSON.stringify(requestContext.request, null, 2));

    let project = requestContext.isBadRequestDueToMissingBody()
    if (!project) {
        return;
    }

    if (!nameRegExp.test(project.name)) {
        requestContext.response.statusCode = HttpStatusCode.BAD_REQUEST;
        requestContext.response.statusMessage = "McmaProject has illegal characters in name.";
        return;
    }

    project = new McmaProject(project);
    project.onCreate(requestContext.publicUrl() + URI_TEMPLATE + "/" + project.name)

    let table = new DynamoDbTable(McmaProject, requestContext.tableName());

    let existingProject = await table.get(project.id);
    if (existingProject) {
        requestContext.response.statusCode = 422;
        requestContext.response.statusMessage = "McmaProject with name '" + project.name + "' already exists.";
        return;
    }

    project = await table.put(project.id, project);

    requestContext.resourceCreated(project);

    Logger.info("createMcmaProject()", JSON.stringify(requestContext.response, null, 2));
}

const updateMcmaProject = async (requestContext) => {
    Logger.info("updateMcmaProject()", JSON.stringify(requestContext.request, null, 2));

    let projectName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(projectName)) {
        requestContext.response.statusCode = HttpStatusCode.BAD_REQUEST;
        requestContext.response.statusMessage = "McmaProject has illegal characters in name.";
        return;
    }

    let project = requestContext.isBadRequestDueToMissingBody()
    if (!project) {
        return;
    }

    project.name = projectName;

    project = new McmaProject(project);
    project.onUpsert(requestContext.publicUrl() + requestContext.request.path);

    let table = new DynamoDbTable(McmaProject, requestContext.tableName());
    project = await table.put(project.id, project);

    requestContext.response.body = project;

    Logger.info("updateMcmaProject()", JSON.stringify(requestContext.response, null, 2));
}

const onBeforeDeleteMcmaProject = async (requestContext) => {
    // TODO check if project has deployments or components
}

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaProject), McmaProject, URI_TEMPLATE)
    .addAll()
    .route(r => r.create).configure(r => r.overrideHandler(createMcmaProject))
    .route(r => r.update).configure(r => r.overrideHandler(updateMcmaProject))
    .route(r => r.delete).configure(r => r.onStarted(onBeforeDeleteMcmaProject))
    .build();

module.exports = routeCollection;