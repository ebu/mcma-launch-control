const fs = require("fs");

const AWS = require("aws-sdk");
AWS.config.loadFromPath("./aws-credentials.json");
const S3 = new AWS.S3();

async function main(terraformOutputJson) {
    let terraformOutput = JSON.parse(fs.readFileSync(terraformOutputJson, "utf8"));

    console.log("Uploading deployment configuration to website");
    let config = {
        service_url: terraformOutput.service_url.value
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

main(process.argv[2]).then(ignored => console.log("Done"));
