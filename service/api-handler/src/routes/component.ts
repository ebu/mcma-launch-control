import { DefaultRouteCollectionBuilder, HttpStatusCode } from "@mcma/api";
import { DynamoDbTableProvider } from "@mcma/aws-dynamodb";
import { McmaComponent } from "@local/commons";
import { DataController } from "@local/data";

const PROJECTS_PATH = "/projects";
const COMPONENTS_PATH = "/components";
const URI_TEMPLATE = PROJECTS_PATH + "/{projectId}" + COMPONENTS_PATH;

const nameRegExp = /^[0-9a-zA-Z\-]+$/;

async function queryComponent(requestContext) {
    console.log("queryComponent()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    let resources = await dc.getComponents(projectId);
    requestContext.setResponseBody(resources);

    console.log("queryComponent()", JSON.stringify(requestContext.response, null, 2));
}

async function createComponent(requestContext) {
    console.log("createComponent()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let component = new McmaComponent(requestContext.getRequestBody());

    if (!component.name) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaComponent is missing the name.");
        return;
    }

    if (!component.displayName) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaComponent is missing the display name.");
        return;
    }

    if (!nameRegExp.test(component.name)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaComponent has illegal characters in name.");
        return;
    }

    component.onCreate(projectId + COMPONENTS_PATH + "/" + component.name);

    let existingComponent = await dc.getComponent(component.id);
    if (existingComponent) {
        requestContext.setResponseStatusCode(HttpStatusCode.UnprocessableEntity, "McmaComponent with name '" + component.name + "' already exists.");
        return;
    }

    component = await dc.setComponent(component);
    requestContext.setResponseResourceCreated(component);

    console.log("createComponent()", JSON.stringify(requestContext.response, null, 2));
}

async function updateComponent(requestContext) {
    console.log("updateComponent()", JSON.stringify(requestContext.request, null, 2));
    let dc = new DataController(requestContext.tableName());

    let projectId = requestContext.publicUrl() + PROJECTS_PATH + "/" + requestContext.request.pathVariables.projectId;
    let project = await dc.getProject(projectId);
    if (!project) {
        requestContext.setResponseStatusCode(HttpStatusCode.NotFound, "McmaProject '" + projectId + "' does not exist.");
        return;
    }

    if (!requestContext.hasRequestBody()) {
        requestContext.setResponseBadRequestDueToMissingBody();
        return;
    }

    let componentName = requestContext.request.pathVariables.id;

    if (!nameRegExp.test(componentName)) {
        requestContext.setResponseStatusCode(HttpStatusCode.BadRequest, "McmaComponent has illegal characters in name.");
        return;
    }

    let component = new McmaComponent(requestContext.getRequestBody());

    component.name = componentName;
    component.onUpsert(requestContext.publicUrl() + requestContext.request.path);

    component = await dc.setComponent(component);
    requestContext.setResponseBody(component);

    console.log("updateComponent()", JSON.stringify(requestContext.response, null, 2));
}

export const componentRoutes = new DefaultRouteCollectionBuilder(new DynamoDbTableProvider(McmaComponent), McmaComponent, URI_TEMPLATE)
    .addAll()
    .route(r => r.query).configure(r => r.overrideHandler(queryComponent))
    .route(r => r.create).configure(r => r.overrideHandler(createComponent))
    .route(r => r.update).configure(r => r.overrideHandler(updateComponent))
    .build();
