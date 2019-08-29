const { promisify } = require("util");

const AWS = require("aws-sdk");
const awsCodeCommit = new AWS.CodeCommit();
const CodeCommit = {
    getRepository: promisify(awsCodeCommit.getRepository.bind(awsCodeCommit)),
    createRepository: promisify(awsCodeCommit.createRepository.bind(awsCodeCommit)),
    deleteRepository: promisify(awsCodeCommit.deleteRepository.bind(awsCodeCommit))
};

module.exports = {
    CodeCommit
};