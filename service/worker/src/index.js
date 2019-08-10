const { Logger } = require("@mcma/core");
const { WorkerBuilder, WorkerRequest } = require("@mcma/worker");

const updateDeployment = async (workerRequest) => {
    Logger.info(workerRequest);
}

const deleteDeployment = async (workerRequest) => {
    Logger.info(workerRequest);
}

const worker =
    new WorkerBuilder()
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