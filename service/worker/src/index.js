const { ConsoleLoggerProvider } = require("@mcma/core");
const { ProviderCollection, Worker, WorkerRequest } = require("@mcma/worker");

const { createProject, deleteProject } = require("./operations/project");
const { updateDeployment, deleteDeployment } = require("./operations/deployment");

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

exports.handler = async (event, context) => {
    try {
        console.info(JSON.stringify(event, null, 2), JSON.stringify(context, null, 2));

        await worker.doWork(new WorkerRequest(event));
    } catch (error) {
        console.error("Error occurred when handling action '" + event.operationName + "'");
        console.error(error.toString());
    }
};
