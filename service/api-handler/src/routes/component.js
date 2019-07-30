
const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");

const { McmaProject } = require("../model/project");
const { McmaComponent } = require("../model/component");

const PROJECTS_PATH = "/projects";
const COMPONENTS_PATH = "/components";
const URI_TEMPLATE = PROJECTS_PATH + "/{projectId}" + COMPONENTS_PATH;

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const queryMcmaComponent = async (requestContext) => {
    Logger.info("queryMcmaComponent()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.response.statusCode = HttpStatusCode.NOT_FOUND;
        requestContext.response.statusMessage = "McmaProject '" + projectId + "' does not exist.";
    }

    let componentTable = new DynamoDbTable(McmaComponent, requestContext.tableName())

    let filter = (resource) => resource.id.startsWith(projectId);
    let resources = await componentTable.query(filter);

    requestContext.response.body = resources;
}

const createMcmaComponent = async (requestContext) => {
    Logger.info("createMcmaComponent()", JSON.stringify(requestContext.request, null, 2));

    let component = requestContext.isBadRequestDueToMissingBody()
    if (!component) {
        return;
    }

    if (!nameRegExp.test(component.name)) {
        requestContext.response.statusCode = HttpStatusCode.BAD_REQUEST;
        requestContext.response.statusMessage = "McmaComponent has illegal characters in name.";
        return;
    }

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.response.statusCode = HttpStatusCode.NOT_FOUND;
        requestContext.response.statusMessage = "McmaProject '" + projectId + "' does not exist.";
        return;
    }

    component = new McmaComponent(component);
    component.onCreate(projectId + COMPONENTS_PATH + "/" + component.name)

    let componentTable = new DynamoDbTable(McmaComponent, requestContext.tableName());

    let existingComponent = await componentTable.get(component.id);
    if (existingComponent) {
        requestContext.response.statusCode = 422;
        requestContext.response.statusMessage = "McmaComponent with name '" + component.name + "' already exists.";
        return;
    }

    component = await componentTable.put(component.id, component);

    requestContext.resourceCreated(component);

    Logger.info("createMcmaComponent()", JSON.stringify(requestContext.response, null, 2));
}

const updateMcmaComponent = async (requestContext) => {
    Logger.info("updateMcmaComponent()", JSON.stringify(requestContext.request, null, 2));

    let componentName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(componentName)) {
        requestContext.response.statusCode = HttpStatusCode.BAD_REQUEST;
        requestContext.response.statusMessage = "McmaComponent has illegal characters in name.";
        return;
    }

    let component = requestContext.isBadRequestDueToMissingBody()
    if (!component) {
        return;
    }

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.response.statusCode = HttpStatusCode.NOT_FOUND;
        requestContext.response.statusMessage = "McmaProject '" + projectId + "' does not exist.";
        return;
    }

    component.name = componentName;

    component = new McmaComponent(component);
    component.onUpsert(requestContext.publicUrl() + requestContext.request.path);

    let componentTable = new DynamoDbTable(McmaComponent, requestContext.tableName());
    component = await componentTable.put(component.id, component);

    requestContext.response.body = component;

    Logger.info("updateMcmaComponent()", JSON.stringify(requestContext.response, null, 2));
}

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaComponent), McmaComponent, URI_TEMPLATE)
    .addAll()
    .route(r => r.query).configure(r => r.overrideHandler(queryMcmaComponent))
    .route(r => r.create).configure(r => r.overrideHandler(createMcmaComponent))
    .route(r => r.update).configure(r => r.overrideHandler(updateMcmaComponent))
    .build();

module.exports = routeCollection;