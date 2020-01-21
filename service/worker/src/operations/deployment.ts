import { URL } from "url";

import * as AWS from "aws-sdk";
import axios, { AxiosError } from "axios";

import { Exception, Resource } from "@mcma/core";
import { AuthProvider, ResourceManager } from "@mcma/client";
import "@mcma/aws-client";

import {
    McmaComponent,
    McmaDeployedComponent,
    McmaDeploymentStatus,
    McmaModule,
    McmaModuleDeploymentActionType,
    McmaProvider,
    McmaVariable
} from "@local/commons";
import { DataController } from "@local/data";

import { Terraform } from "../tools/terraform";
import { Git } from "../tools/git";
import { VariableResolver } from "../tools/variable-resolver";

const CodeCommit = new AWS.CodeCommit();

const REPOSITORY_DIR = "/tmp/repo";

const GLOBAL_PREFIX = process.env.GlobalPrefix;

const AWS_ACCOUNT_ID = process.env.AwsAccountId;
const AWS_ACCESS_KEY = process.env.AwsAccessKey;
const AWS_SECRET_KEY = process.env.AwsSecretKey;
const AWS_REGION = process.env.AwsRegion;

const GIT_USERNAME = process.env.AwsCodeCommitUsername;
const GIT_PASSWORD = process.env.AwsCodeCommitPassword;

async function getModules(components: McmaComponent[] | McmaDeployedComponent[]): Promise<Map<string, McmaModule>> {
    let map = new Map<string, McmaModule>();

    for (const component of components) {
        try {
            const response = await axios.get<McmaModule>(component.module);
            map.set(component.name, response.data);
        } catch (err) {
            if (err && err.response) {
                const axiosError = err as AxiosError<any>;
                return axiosError.response.data;
            }

            throw err;
        }
    }

    return map;
}

function generateGitIgnore() {
    return ".terraform\n" +
        ".terraform.tfstate.lock.info\n" +
        "terraform.tfstate.backup\n" +
        "terraform.tfvars.json\n";
}

function generateMainTfJson(vr: VariableResolver, providers: McmaProvider[], components: McmaComponent[]) {
    const terraformProviders = [];

    for (const provider of providers) {
        const variables = {};

        for (const variable of provider.variables) {
            let value = variable.value;
            if (value) {
                variables[variable.name] = vr.resolve(value).value;
            }
        }
        const terraformProvider = {};
        terraformProvider[provider.type] = variables;

        terraformProviders.push(terraformProvider);
    }

    const terraformModules = [];

    for (const component of components) {
        const variables = {};

        for (const variable of component.variables) {
            variables[variable.name] = vr.resolve(variable.value).value;
        }

        variables["source"] = component.module.substring(0, component.module.length - 4) + "zip";

        const module = {};
        module[component.name] = variables;

        terraformModules.push(module);
    }

    const mainTfJson = {
        terraform: {
            required_version: ">= 0.12.0",
            backend: {
                local: {}
            }
        },
        provider: terraformProviders,
        module: terraformModules
    };

    return JSON.stringify(mainTfJson, null, 2);
}

function generateVariablesTfJson() {
    const variablesTfJson = {
        variable: {
            project_prefix: {},
            stage_name: {},
            aws_account_id: {},
            aws_access_key: {},
            aws_secret_key: {},
            aws_region: {}
        }
    };

    return JSON.stringify(variablesTfJson, null, 2);
}

function generateTerraformTfVarsJson(project, deploymentConfig) {
    const terraformTfVarsJson = {
        project_prefix: GLOBAL_PREFIX + "." + project.name + "." + deploymentConfig.name,
        stage_name: deploymentConfig.name,
        aws_account_id: AWS_ACCOUNT_ID,
        aws_access_key: AWS_ACCESS_KEY,
        aws_secret_key: AWS_SECRET_KEY,
        aws_region: AWS_REGION
    };
    return JSON.stringify(terraformTfVarsJson, null, 2);
}

function generateOutputsTfJson(components: McmaComponent[]) {

    const outputTfJson = {
        output: {}
    };

    for (const component of components) {
        outputTfJson.output[component.name] = {
            value: "${module." + component.name + "}"
        };
    }

    return JSON.stringify(outputTfJson, null, 2);
}

async function getRepositoryUrl(project) {
    const repositoryName = project.name;
    const repoData = await CodeCommit.getRepository({ repositoryName }).promise();

    console.log(JSON.stringify(repoData, null, 2));

    const repoUrl = new URL(repoData.repositoryMetadata.cloneUrlHttp);
    repoUrl.username = GIT_USERNAME;
    repoUrl.password = GIT_PASSWORD;
    return repoUrl.toString();
}

function getResourceManagerConfig(deployedComponents: McmaDeployedComponent[]) {
    // finding a service registry by searching for the 'services_url' output property

    for (const deployedComponent of deployedComponents) {
        const vr = new VariableResolver();
        vr.putAll(deployedComponent.outputVariables);
        if (vr.has("services_url")) {
            return {
                servicesUrl: vr.get("services_url").value,
                servicesAuthType: vr.has("auth_type") ? vr.get("auth_type").value : undefined,
                servicesAuthContext: vr.has("auth_context") ? vr.get("auth_type").value : undefined,
            };
        }
    }
}

function replaceVariables(value: any, vr: VariableResolver): any {
    if (typeof value === "string") {
        return vr.resolve(<string>value).value;
    } else if (value instanceof Array) {
        return (<any[]>value).map(item => replaceVariables(item, vr));
    } else if (value instanceof Object) {
        const obj = {};
        for (const key of Object.keys(value)) {
            obj[key] = replaceVariables(value[key], vr);
        }
        return obj;
    } else {
        return value;
    }
}

async function processPreDestroyActions(components: McmaComponent[], oldDeployedComponents: McmaDeployedComponent[], oldModulesMap: Map<string, McmaModule>) {
    const resourceManagerConfig = getResourceManagerConfig(oldDeployedComponents);

    const componentsMap = new Map<string, McmaComponent>();
    for (const component of components) {
        componentsMap.set(component.name, component);
    }

    for (const deployedComponent of oldDeployedComponents) {
        const module = oldModulesMap.get(deployedComponent.name);

        if (module.deploymentActions) {
            for (const action of module.deploymentActions) {
                console.log("Processing pre destroy action:", JSON.stringify(action, null, 2));

                switch (action.type) {
                    case McmaModuleDeploymentActionType.ManagedResource:
                        if (!resourceManagerConfig) {
                            throw new Exception("Failed to execute post deployment action. Unable to find a deployed Service Registry");
                        }
                        const resourceManager = new ResourceManager(resourceManagerConfig, new AuthProvider().addAwsV4Auth({
                            accessKey: AWS_ACCESS_KEY,
                            secretKey: AWS_SECRET_KEY,
                            region: AWS_REGION
                        }));

                        const resourceName = action.data.resourceName;
                        if (!resourceName) {
                            throw new Exception("Property 'resourceName' missing in deployment action 'ManagedResource'");
                        }

                        const resourceVariable = deployedComponent.resources.find(r => r.name === resourceName);
                        if (resourceVariable) {
                            const resourceId = resourceVariable.value;
                            if (resourceId) {
                                try {
                                    console.log("Deleting managed resource '" + resourceName + "' with id: " + resourceId);
                                    // TODO: pass resourceId when upgrading to MCMA libraries 0.8.6
                                    await resourceManager.delete(<Resource>{ id: resourceId });
                                } catch (error) {
                                    console.warn("Failed to delete resource '" + resourceId + "'");
                                    console.warn(error.toString());
                                }
                            }
                        }

                        break;
                    case McmaModuleDeploymentActionType.RunScript:
                        throw new Exception("Deployment action '" + action.type + "' not implemented");
                    default:
                        throw new Exception("Unrecognized deployment action '" + action.type + "'");
                }
            }
        }
    }
}

function generateDeployedComponents(deploymentId: string, components: McmaComponent[], terraformOutput: any): McmaDeployedComponent[] {
    const result: McmaDeployedComponent[] = [];

    for (const component of components) {
        const deployedComponent = new McmaDeployedComponent(component);
        deployedComponent.id = deploymentId + "/" + component.name;

        //TODO replace inputVariables with resolved variables while variables keeps the original configuration copied from the component.
        deployedComponent.inputVariables = deployedComponent.variables;
        for (const varName of Object.keys(terraformOutput[component.name].value)) {
            deployedComponent.outputVariables.push(new McmaVariable({
                name: varName,
                value: terraformOutput[component.name].value[varName]
            }));
        }

        result.push(deployedComponent);
    }

    return result;
}

async function processDeploymentActions(oldDeployedComponents: McmaDeployedComponent[], newDeployedComponents: McmaDeployedComponent[], modulesMap: Map<string, McmaModule>) {
    const resourceManagerConfig = getResourceManagerConfig(newDeployedComponents);

    const oldDeployedComponentsMap = new Map<string, McmaDeployedComponent>();
    for (const deployedComponent of oldDeployedComponents) {
        oldDeployedComponentsMap.set(deployedComponent.name, deployedComponent);
    }

    for (const deployedComponent of newDeployedComponents) {
        const module = modulesMap.get(deployedComponent.name);

        if (module.deploymentActions) {
            for (const action of module.deploymentActions) {
                console.log("Processing post deploy action:", JSON.stringify(action, null, 2));

                switch (action.type) {
                    case McmaModuleDeploymentActionType.ManagedResource:
                        if (!resourceManagerConfig) {
                            throw new Exception("Failed to execute post deployment action. Unable to find a deployed Service Registry");
                        }
                        const resourceManager = new ResourceManager(resourceManagerConfig, new AuthProvider().addAwsV4Auth({
                            accessKey: AWS_ACCESS_KEY,
                            secretKey: AWS_SECRET_KEY,
                            region: AWS_REGION
                        }));

                        const vr = new VariableResolver();
                        vr.putAll(deployedComponent.outputVariables);

                        const resourceName = action.data.resourceName;
                        if (!resourceName) {
                            throw new Exception("Property 'resourceName' missing in deployment action 'ManagedResource'");
                        }

                        let resource = action.data.resource;
                        if (!resource) {
                            throw new Exception("Property 'resource' missing in deployment action 'ManagedResource'");
                        }
                        resource = replaceVariables(resource, vr);

                        const oldDeployedComponent = oldDeployedComponentsMap.get(deployedComponent.name);
                        if (oldDeployedComponent && oldDeployedComponent.resources && oldDeployedComponent.resources.find(r => r.name === resourceName)) {
                            resource.id = oldDeployedComponent.resources.find(r => r.name === resourceName).value;
                            resource = await resourceManager.update(resource);
                        } else {
                            resource = await resourceManager.create(resource);
                        }

                        console.log("Creating managed resource '" + resourceName + "' with id: " + resource.id);
                        deployedComponent.resources.push(new McmaVariable({ name: resourceName, value: resource.id }));
                        break;
                    case McmaModuleDeploymentActionType.RunScript:
                        throw new Exception("Deployment action '" + action.type + "' not implemented");
                    default:
                        throw new Exception("Unrecognized deployment action '" + action.type + "'");
                }
            }
        }
    }
}

export async function updateDeployment(providerCollection, workerRequest) {
    try {
        console.log("updateDeployment", JSON.stringify(workerRequest, null, 2));
        const dc = new DataController(workerRequest.tableName());

        const { projectId, deploymentConfigId, deploymentId } = workerRequest.input;

        const project = await dc.getProject(projectId);
        const components = await dc.getComponents(projectId);
        const modulesMap = await getModules(components);
        const deploymentConfig = await dc.getDeploymentConfig(deploymentConfigId);
        const deployment = await dc.getDeployment(deploymentId);
        const oldDeployedComponents = await dc.getDeployedComponents(deploymentId);
        const oldModulesMap = await getModules(oldDeployedComponents);

        console.log(JSON.stringify(project, null, 2));
        console.log(JSON.stringify(deployment, null, 2));
        console.log(JSON.stringify(deploymentConfig, null, 2));

        if (!project || !deploymentConfig || !deployment) {
            console.warn("Project, DeploymentConfig and/or Deployment missing from DynamoDB Table");
            return;
        }

        const vr = new VariableResolver();
        vr.putAll(project.variables);
        vr.putAll(deploymentConfig.variables);

        let errorMessage = null;

        try {
            try {
                console.log("Running pre destroy actions");
                await processPreDestroyActions(components, oldDeployedComponents, oldModulesMap);
            } catch (error) {
                console.error(error.toString());
            }

            Git.setWorkingDir(REPOSITORY_DIR);
            Terraform.setWorkingDir(REPOSITORY_DIR);

            const repoUrl = await getRepositoryUrl(project);

            await Git.clone(repoUrl);
            await Git.config("Launch Control", "launch-control@mcma.ebu.ch");

            const isNewRepository = await Git.isNew();

            await Git.writeFile(".gitignore", generateGitIgnore());
            await Git.writeFile("main.tf.json", generateMainTfJson(vr, project.providers, components));
            // await Git.writeFile("variables.tf.json", generateVariablesTfJson());
            // await Git.writeFile("terraform.tfvars.json", generateTerraformTfVarsJson(project, deploymentConfig));
            await Git.writeFile("outputs.tf.json", generateOutputsTfJson(components));

            await Git.addFiles();
            if (isNewRepository || await Git.hasChanges()) {
                if (!isNewRepository) {
                    await Git.pull();
                }
                await Git.commit("Updating Terraform configuration");
                await Git.push();
            }

            let terraformOutput;

            try {
                await Terraform.init(deploymentConfig.name);
                await Terraform.apply();
                terraformOutput = await Terraform.output();
            } catch (error) {
                errorMessage = error.message;
            }

            await Git.addFiles();
            if (await Git.hasChanges()) {
                await Git.pull();
                await Git.commit("Deployment '" + deploymentConfig.name + "' is updated " + (errorMessage ? "with errors during deployment" : "successfully"));
                await Git.push();
            }

            if (!errorMessage) {
                const newDeployedComponents: McmaDeployedComponent[] = generateDeployedComponents(deploymentId, components, terraformOutput);

                console.log("Running post deployment actions");
                try {
                    await processDeploymentActions(oldDeployedComponents, newDeployedComponents, modulesMap);
                } catch (error) {
                    console.error(error.toString());
                    errorMessage = error.message;
                }

                console.log("Updating deployed components for deploymentConfig");
                for (const deployedComponent of oldDeployedComponents) {
                    await dc.deleteDeployedComponent(deployedComponent.id);
                }

                for (const deployedComponent of newDeployedComponents) {
                    await dc.setDeployedComponent(deployedComponent);
                }
            }

            deployment.status = errorMessage ? McmaDeploymentStatus.Error : McmaDeploymentStatus.OK;
            deployment.statusMessage = errorMessage;
        } catch (error) {
            console.error(error);
            deployment.status = McmaDeploymentStatus.Error;
            deployment.statusMessage = error.message;
        }

        await dc.setDeployment(deployment);
    } catch (error) {
        console.error(error);
    }
}

export async function deleteDeployment(providerCollection, workerRequest) {
    try {
        console.log("deleteDeployment", JSON.stringify(workerRequest, null, 2));
        const dc = new DataController(workerRequest.tableName());

        const { projectId, deploymentConfigId, deploymentId } = workerRequest.input;

        const project = await dc.getProject(projectId);
        const deployment = await dc.getDeployment(deploymentId);
        const deploymentConfig = await dc.getDeploymentConfig(deploymentConfigId);
        const oldDeployedComponents = await dc.getDeployedComponents(deploymentId);
        const oldModulesMap = await getModules(oldDeployedComponents);

        console.log(JSON.stringify(project, null, 2));
        console.log(JSON.stringify(deployment, null, 2));
        console.log(JSON.stringify(deploymentConfig, null, 2));

        if (!project || !deploymentConfig || !deployment) {
            console.warn("Project, DeploymentConfig and/or Deployment missing from DynamoDB Table");
            return;
        }

        try {
            try {
                console.log("Running pre destroy actions");
                await processPreDestroyActions([], oldDeployedComponents, oldModulesMap);
            } catch (error) {
                console.error(error.toString());
            }

            Git.setWorkingDir(REPOSITORY_DIR);
            Terraform.setWorkingDir(REPOSITORY_DIR);

            const repoUrl = await getRepositoryUrl(project);

            await Git.clone(repoUrl);
            await Git.config("Launch Control", "launch-control@mcma.ebu.ch");

            // await Git.writeFile("terraform.tfvars.json", generateTerraformTfVarsJson(project, deploymentConfig));

            await Terraform.init(deploymentConfig.name);
            await Terraform.destroy();

            await Git.addFiles();
            if (await Git.hasChanges()) {
                await Git.pull();
                await Git.commit("Deployment '" + deploymentConfig.name + "' is destroyed");
                await Git.push();
            }

            console.log("Deleting deployed components for deploymentConfig");
            for (const deployedComponent of oldDeployedComponents) {
                await dc.deleteDeployedComponent(deployedComponent.id);
            }

            await dc.deleteDeployment(deployment.id);
        } catch (error) {
            console.warn(error);
            deployment.status = McmaDeploymentStatus.Error;
            deployment.statusMessage = error.message;
            await dc.setDeployment(deployment);
        }
    } catch (error) {
        console.error(error);
    }
}
