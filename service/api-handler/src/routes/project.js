
const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");

const { McmaProject } = require("../model/project");

const ROOT = "/projects"

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
    project.onCreate(requestContext.publicUrl() + ROOT + "/" + project.name)

    let table = new DynamoDbTable(McmaProject, requestContext.tableName());

    let oldProject = await table.get(project.id);
    if (oldProject) {
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

    Logger.info(JSON.stringify(requestContext.response, null, 2));
}

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaProject), McmaProject, ROOT)
    .addAll()
    .route(r => r.create).configure(r => r.overrideHandler(createMcmaProject))
    .route(r => r.update).configure(r => r.overrideHandler(updateMcmaProject))
    .build();

module.exports = routeCollection;