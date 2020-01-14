//"use strict";

import { McmaApiRouteCollection } from "@mcma/api";
import "@mcma/aws-api-gateway";

import { deploymentConfigRoutes } from "./routes/deployment-config";
import { projectRoutes } from "./routes/project";
import { componentRoutes }  from "./routes/component";
import { deploymentRoutes }  from "./routes/deployment";
import { deployedComponentRoutes } from "./routes/deployed-component";

const restController = new McmaApiRouteCollection()
    .addRoutes(deploymentConfigRoutes)
    .addRoutes(projectRoutes)
    .addRoutes(componentRoutes)
    .addRoutes(deploymentRoutes)
    .addRoutes(deployedComponentRoutes)
    .toApiGatewayApiController();

export async function handler(event, context) {
    console.log(JSON.stringify(event, null, 2), JSON.stringify(context, null, 2));

    return await restController.handleRequest(event, context);
}
