import { ConsoleLoggerProvider } from "@mcma/core";

import { ProviderCollection, Worker, WorkerRequest } from "@mcma/worker";

import { deleteDeployment, updateDeployment } from "./operations/deployment";
import { createProject, deleteProject } from "./operations/project";

const loggerProvider = new ConsoleLoggerProvider("launch-control-worker");

const providerCollection = new ProviderCollection({
    loggerProvider
});

const worker =
    new Worker(providerCollection)
        .addOperation("CreateProject", createProject)
        .addOperation("DeleteProject", deleteProject)
        .addOperation("UpdateDeployment", updateDeployment)
        .addOperation("DeleteDeployment", deleteDeployment);

export async function handler(event, context) {
    try {
        console.info(JSON.stringify(event, null, 2), JSON.stringify(context, null, 2));

        await worker.doWork(new WorkerRequest(event));
    } catch (error) {
        console.error("Error occurred when handling action '" + event.operationName + "'");
        console.error(error.toString());
    }
}
