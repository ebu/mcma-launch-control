const { Logger } = require("@mcma/core");
const { WorkerBuilder, WorkerRequest } = require("@mcma/worker");

const { createProject, deleteProject } = require("./operations/project");
const { updateDeployment, deleteDeployment } = require("./operations/deployment");

const worker =
    new WorkerBuilder()
        .handleOperation(createProject)
        .handleOperation(deleteProject)
        .handleOperation(updateDeployment)
        .handleOperation(deleteDeployment)
        .build();

exports.handler = async (event, context) => {
    try {
        Logger.debug(JSON.stringify(event, null, 2), JSON.stringify(context, null, 2));

        await worker.doWork(new WorkerRequest(event));
    } catch (error) {
        Logger.error("Error occurred when handling action '" + event.operationName + "'");
        Logger.exception(error.toString());
    }
};