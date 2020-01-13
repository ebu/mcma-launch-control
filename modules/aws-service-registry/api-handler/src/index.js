//"use strict";
const { Service, JobProfile } = require("@mcma/core");
const { McmaApiRouteCollection, DefaultRouteCollectionBuilder } = require("@mcma/api");
const { DynamoDbTableProvider } = require("@mcma/aws-dynamodb");
require("@mcma/aws-api-gateway");

const serviceDbTableProvider = new DynamoDbTableProvider(Service);
const profileDbTableProvider = new DynamoDbTableProvider(JobProfile);

const controller =
    new McmaApiRouteCollection()
        .addRoutes(new DefaultRouteCollectionBuilder(serviceDbTableProvider, Service).addAll().build())
        .addRoutes(new DefaultRouteCollectionBuilder(profileDbTableProvider, JobProfile).addAll().build())
        .toApiGatewayApiController();

exports.handler = async (event, context) => {
    console.info(JSON.stringify(event, null, 2), JSON.stringify(event, null, 2));

    const resp = await controller.handleRequest(event, context);
    console.info(resp);
    return resp;
};
