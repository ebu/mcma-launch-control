
const { Logger } = require("@mcma/core");
const { DefaultRouteCollectionBuilder, HttpStatusCode } = require("@mcma/api");
const { DynamoDbTable, DynamoDbTableProvider } = require("@mcma/aws-dynamodb");

const { McmaProject } = require("commons");

const URI_TEMPLATE = "/projects"

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

const createProject = async (requestContext) => {
    Logger.info("createProject()", JSON.stringify(requestContext.request, null, 2));

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let project = new McmaProject(requestContext.getRequestBody());
    
    if (!nameRegExp.test(project.name)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "McmaProject has illegal characters in name.");
        return;
    }
    
    project.onCreate(requestContext.publicUrl() + URI_TEMPLATE + "/" + project.name)

    let table = new DynamoDbTable(McmaProject, requestContext.tableName());
    
    let existingProject = await table.get(project.id);
    if (existingProject) {
        requestContext.setResponseStatusCode(HttpStatusCode.UNPROCESSABLE_ENTITY, "McmaProject with name '" + project.name + "' already exists.");
        return;
    }

    project = await table.put(project.id, project);

    requestContext.setResponseResourceCreated(project);

    Logger.info("createProject()", JSON.stringify(requestContext.response, null, 2));
}

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

    let project = new McmaProject(requestContext.getRequestBody());
    project.name = projectName;
    project.onUpsert(requestContext.publicUrl() + requestContext.request.path);
    
    let table = new DynamoDbTable(McmaProject, requestContext.tableName());
    project = await table.put(project.id, project);

    requestContext.setResponseBody(project);

    Logger.info("updateProject()", JSON.stringify(requestContext.response, null, 2));
}

const onBeforeDeleteProject = async (requestContext) => {
    // TODO check if project has deployments or components
}

const routeCollection = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaProject), McmaProject, URI_TEMPLATE)
    .addAll()
    .route(r => r.create).configure(r => r.overrideHandler(createProject))
    .route(r => r.update).configure(r => r.overrideHandler(updateProject))
    .route(r => r.delete).configure(r => r.onStarted(onBeforeDeleteProject))
    .build();

module.exports = routeCollection;