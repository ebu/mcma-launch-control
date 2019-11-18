const { DataController } = require("@local/data");

const { CodeCommit } = require("./tools/codecommit");

const createProject = async (providerCollection, workerRequest) => {
    let dc = new DataController(workerRequest.tableName());

    let project = await dc.getProject(workerRequest.input.projectId);

    let repositoryName = project.name;

    console.log(project);

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

    console.log(repository);
};

const deleteProject = async (providerCollection, workerRequest) => {
    let repositoryName = workerRequest.input.projectName;

    let repositoryId = await CodeCommit.deleteRepository({ repositoryName });

    console.log({ repositoryId });
};

module.exports = {
    createProject,
    deleteProject
};
