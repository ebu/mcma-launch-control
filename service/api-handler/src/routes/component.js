
const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");

const { McmaProject } = require("../model/project");
const { McmaComponent } = require("../model/component");

const PROJECTS_PATH = "/projects";
const COMPONENTS_PATH = "/components";
const URI_TEMPLATE = PROJECTS_PATH + "/{projectId}" + COMPONENTS_PATH;

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const queryComponent = async (requestContext) => {
    Logger.info("queryComponent()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let componentTable = new DynamoDbTable(McmaComponent, requestContext.tableName())
    let resources = await componentTable.query((resource) => resource.id.startsWith(projectId));

    requestContext.setResponseBody(resources);

    Logger.info("queryComponent()", JSON.stringify(requestContext.response, null, 2));
}

const createComponent = async (requestContext) => {
    Logger.info("createComponent()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let component = requestContext.getRequestBody();

    if (!nameRegExp.test(component.name)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaComponent has illegal characters in name.");
        return;
    }

    component = new McmaComponent(component);
    component.onCreate(projectId + COMPONENTS_PATH + "/" + component.name)

    let componentTable = new DynamoDbTable(McmaComponent, requestContext.tableName());

    let existingComponent = await componentTable.get(component.id);
    if (existingComponent) {
        requestContext.setResponseStatusCode(HttpStatusCode.UNPROCESSABLE_ENTITY, "McmaComponent with name '" + component.name + "' already exists.");
        return;
    }

    component = await componentTable.put(component.id, component);

    requestContext.setResponseResourceCreated(component);

    Logger.info("createComponent()", JSON.stringify(requestContext.response, null, 2));
}

const updateComponent = async (requestContext) => {
    Logger.info("updateComponent()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(McmaProject, requestContext.tableName());
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let componentName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(componentName)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaComponent has illegal characters in name.");
        return;
    }

    let component = requestContext.getRequestBody();

    component.name = componentName;

    component = new McmaComponent(component);
    component.onUpsert(requestContext.publicUrl() + requestContext.request.path);

    let componentTable = new DynamoDbTable(McmaComponent, requestContext.tableName());
    component = await componentTable.put(component.id, component);

    requestContext.setResponseBody(component);

    Logger.info("updateComponent()", JSON.stringify(requestContext.response, null, 2));
}

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaComponent), McmaComponent, URI_TEMPLATE)
    .addAll()
    .route(r => r.query).configure(r => r.overrideHandler(queryComponent))
    .route(r => r.create).configure(r => r.overrideHandler(createComponent))
    .route(r => r.update).configure(r => r.overrideHandler(updateComponent))
    .build();

module.exports = routeCollection;