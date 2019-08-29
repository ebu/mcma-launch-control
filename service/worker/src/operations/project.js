const { Logger } = require("@mcma/core");

const { DataController } = require("data");

const { CodeCommit } = require("./codecommit");

const createProject = async (workerRequest) => {
    let dc = new DataController(workerRequest.tableName());

    let project = await dc.getProject(workerRequest.input.projectId);

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

module.exports = {
  createProject,
  deleteProject
};