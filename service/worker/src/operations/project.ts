import { DataController } from "@local/data";

import * as AWS from "aws-sdk"
const CodeCommit = new AWS.CodeCommit();

export async function createProject(providerCollection, workerRequest) {
    let dc = new DataController(workerRequest.tableName());

    let project = await dc.getProject(workerRequest.input.projectId);

    let repositoryName = project.name;

    console.log(JSON.stringify(project, null, 2));

    let repository;
    try {
        repository = await CodeCommit.getRepository({ repositoryName }).promise();
    } catch (error) {
        if (error.code === "RepositoryDoesNotExistException") {
            repository = await CodeCommit.createRepository({ repositoryName }).promise();
        } else {
            throw error;
        }
    }

    console.log(JSON.stringify(repository, null, 2));
}

export async function deleteProject(providerCollection, workerRequest) {
    let repositoryName = workerRequest.input.projectName;

    let repositoryId = await CodeCommit.deleteRepository({ repositoryName }).promise();

    console.log({ repositoryId });
}
