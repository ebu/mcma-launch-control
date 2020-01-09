const fs = require("fs");

const AWS = require("aws-sdk");
AWS.config.loadFromPath("./aws-credentials.json");
const S3 = new AWS.S3();
const Cognito = new AWS.CognitoIdentityServiceProvider();

global.fetch = require("node-fetch");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

async function initializeCognitoUser(terraformOutput) {
    // 1. (Re)create cognito user for website
    let username = "mcma";
    let tempPassword = "b9BC9aX6B3yQK#nr";
    let password = "%bshgkUTv*RD$sR7";

    try {
        let params = {
            UserPoolId: terraformOutput.cognito_user_pool_id.value,
            Username: "mcma"
        };

        await Cognito.adminDeleteUser(params).promise();
        console.log("Deleting existing user");
    } catch (error) {
    }

    try {
        let params = {
            UserPoolId: terraformOutput.cognito_user_pool_id.value,
            Username: username,
            MessageAction: "SUPPRESS",
            TemporaryPassword: tempPassword
        };

        console.log("Creating user '" + username + "' with temporary password");
        await Cognito.adminCreateUser(params).promise();

        let authenticationData = {
            Username: username,
            Password: tempPassword,
        };
        let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        let poolData = {
            UserPoolId: terraformOutput.cognito_user_pool_id.value,
            ClientId: terraformOutput.cognito_user_pool_client_id.value
        };
        let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        let userData = {
            Username: username,
            Pool: userPool
        };
        let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        console.log("Authenticating user '" + username + "' with temporary password");
        await new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (ignored) {
                    resolve();
                },

                onFailure: function (err) {
                    console.log("Unexpected error:", err);
                    reject(err);
                },

                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    console.log("Changing temporary password to final password");
                    cognitoUser.completeNewPasswordChallenge(password, requiredAttributes, {
                        onSuccess: (ignored) => {
                            console.log("User '" + username + "' is ready with password '" + password + "'");
                            resolve();
                        },
                        onFailure: (err) => {
                            console.log("Unexpected error:", err);
                            reject(err);
                        }
                    });
                }
            });
        });
    } catch (error) {
        console.log("Failed to setup user due to error:", error);
    }
}

async function uploadWebsiteConfiguration(terraformOutput) {
    console.log("Uploading deployment configuration to website");
    let config = {
        service_url: terraformOutput.service_url.value,
        repository_bucket_name: terraformOutput.repository_bucket_name.value,
        repository_url: terraformOutput.repository_url.value,
    };

    let s3Params = {
        Bucket: terraformOutput.website_bucket_name.value,
        Key: "config.json",
        Body: JSON.stringify(config)
    };

    try {
        await S3.putObject(s3Params).promise();
    } catch (error) {
        console.error(error);
    }
}

async function main(terraformOutputJson) {
    let terraformOutput = JSON.parse(fs.readFileSync(terraformOutputJson, "utf8"));

    await initializeCognitoUser(terraformOutput);

    await uploadWebsiteConfiguration(terraformOutput);
}

main(process.argv[2]).then(ignored => console.log("Done"));
