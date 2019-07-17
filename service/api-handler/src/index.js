//"use strict";

const AWS = require("aws-sdk");
const MCMA_AWS = require("mcma-aws");
const uuidv4 = require('uuid/v4');

// async functions to handle the different routes.

const getDeploymentConfigs = async (request, response) => {
    console.log("getDeploymentConfigs()", JSON.stringify(request, null, 2));

    response.body = [];

    console.log(JSON.stringify(response, null, 2));
}

// Initializing rest controller for API Gateway Endpoint
const restController = new MCMA_AWS.ApiGatewayRestController();

// adding routes
restController.addRoute("GET", "/deployment-configs", getDeploymentConfigs);


exports.handler = async (event, context) => {
    console.log(JSON.stringify(event, null, 2), JSON.stringify(context, null, 2));

    return await restController.handleRequest(event, context);
}
