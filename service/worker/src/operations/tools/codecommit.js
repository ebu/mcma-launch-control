const util = require('util');

const AWS = require("aws-sdk");
const awsCodeCommit = new AWS.CodeCommit();
const CodeCommit = {
    getRepository: util.promisify(awsCodeCommit.getRepository.bind(awsCodeCommit)),
    createRepository: util.promisify(awsCodeCommit.createRepository.bind(awsCodeCommit)),
    deleteRepository: util.promisify(awsCodeCommit.deleteRepository.bind(awsCodeCommit))
};

module.exports = {
    CodeCommit
};