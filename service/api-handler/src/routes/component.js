const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");

const { McmaComponent, McmaProject } = require("commons");

const PROJECTS_PATH = "/projects";
const COMPONENTS_PATH = "/components";
const URI_TEMPLATE = PROJECTS_PATH + "/{projectId}" + COMPONENTS_PATH;

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const queryComponent = async (requestContext) => {
    console.log("queryComponent()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(requestContext.tableName(), McmaProject);
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let componentTable = new DynamoDbTable(requestContext.tableName(), McmaComponent);
    let resources = await componentTable.query((resource) => resource.id.startsWith(projectId));

    requestContext.setResponseBody(resources);

    console.log("queryComponent()", JSON.stringify(requestContext.response, null, 2));
};

const createComponent = async (requestContext) => {
    console.log("createComponent()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(requestContext.tableName(), McmaProject);
    let project = await projectTable.get(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let component = new McmaComponent(requestContext.getRequestBody());

    if (!component.name) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaComponent is missing the name.");
        return;
    }

    if (!component.displayName) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaComponent is missing the display name.");
        return;
    }

    if (!nameRegExp.test(component.name)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaComponent has illegal characters in name.");
        return;
    }

    component.onCreate(projectId + COMPONENTS_PATH + "/" + component.name);

    let componentTable = new DynamoDbTable(requestContext.tableName(), McmaComponent);

    let existingComponent = await componentTable.get(component.id);
    if (existingComponent) {
        requestContext.setResponseStatusCode(HttpStatusCode.UNPROCESSABLE_ENTITY, "McmaComponent with name '" + component.name + "' already exists.");
        return;
    }

    component = await componentTable.put(component.id, component);

    requestContext.setResponseResourceCreated(component);

    console.log("createComponent()", JSON.stringify(requestContext.response, null, 2));
};

const updateComponent = async (requestContext) => {
    console.log("updateComponent()", JSON.stringify(requestContext.request, null, 2));

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let projectTable = new DynamoDbTable(requestContext.tableName(), McmaProject);
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

    let component = new McmaComponent(requestContext.getRequestBody());

    component.name = componentName;
    component.onUpsert(requestContext.publicUrl() + requestContext.request.path);

    let componentTable = new DynamoDbTable(requestContext.tableName(), McmaComponent);
    component = await componentTable.put(component.id, component);

    requestContext.setResponseBody(component);

    console.log("updateComponent()", JSON.stringify(requestContext.response, null, 2));
};

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaComponent), McmaComponent, URI_TEMPLATE)
    .addAll()
    .route(r => r.query).configure(r => r.overrideHandler(queryComponent))
    .route(r => r.create).configure(r => r.overrideHandler(createComponent))
    .route(r => r.update).configure(r => r.overrideHandler(updateComponent))
    .build();

module.exports = routeCollection;
