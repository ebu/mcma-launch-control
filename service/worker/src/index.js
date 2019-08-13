const { promisify } = require("util");

const AWS = require("aws-sdk");
const awsCodeCommit = new AWS.CodeCommit();
const CodeCommit = {
    getRepository: promisify(awsCodeCommit.getRepository.bind(awsCodeCommit)),
    createRepository: promisify(awsCodeCommit.createRepository.bind(awsCodeCommit)),
    deleteRepository: promisify(awsCodeCommit.deleteRepository.bind(awsCodeCommit))
};

const { Logger } = require("@mcma/core");
const { WorkerBuilder, WorkerRequest } = require("@mcma/worker");
const { DynamoDbTable } = require("@mcma/aws-dynamodb");

const { McmaProject } = require("commons");

const createProject = async (workerRequest) => {
    let projectId = workerRequest.input.projectId;

    let table = new DynamoDbTable(McmaProject, workerRequest.tableName());

    let project = new McmaProject(await table.get(projectId));

    let repositoryName = project.name;

    Logger.info(project);

    let repository;
    try {
        repository = await CodeCommit.getRepository({ repositoryName });
    } catch (error) {
        if (error.code === "RepositoryDoesNotExistException") {
            repository = await CodeCommit.createRepository({ repositoryName });
        } else {
            throw error;
        }
    }

    Logger.info(repository);
};

const deleteProject = async (workerRequest) => {
    let repositoryName = workerRequest.input.projectName;

    let repositoryId = await CodeCommit.deleteRepository({ repositoryName });

    Logger.info({ repositoryId });
};

const updateDeployment = async (workerRequest) => {
    Logger.info(workerRequest);
};

const deleteDeployment = async (workerRequest) => {
    Logger.info(workerRequest);
};

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