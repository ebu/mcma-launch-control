import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ModuleRepositoryData } from "../data/module-repository";
import { McmaModule, McmaModuleParameter } from "commons";
import { ConfigService } from "../utils";

@Injectable()
export class ModuleRepositoryService extends ModuleRepositoryData {
    constructor(private config: ConfigService) {
        super();
    }

    getModules(): Observable<McmaModule[]> {
        return this.config.get<string>("repository_url").pipe(
            map(repositoryUrl => {
                return [
                    new McmaModule({
                        id: repositoryUrl + "/aws_s3_bucket.zip",
                        provider: "ebu",
                        name: "aws_s3_bucket",
                        version: "0.0.1",
                        displayName: "AWS S3 Bucket",
                        description: "A managed AWS S3 bucket",
                        inputParameters: [
                            new McmaModuleParameter({
                                name: "bucket_name",
                                type: "string",
                            }),
                        ],
                    }),
                    new McmaModule({
                        id: repositoryUrl + "/aws_service_registry.zip",
                        provider: "ebu",
                        name: "aws_service_registry",
                        version: "0.0.1",
                        displayName: "AWS MCMA Service Registry",
                        description: "The MCMA Service Registry serves as a central 'yellow pages' for services to discover what other services are available.",
                        inputParameters: [
                            new McmaModuleParameter({
                                name: "module_prefix",
                                type: "string",
                            }),
                            new McmaModuleParameter({
                                name: "stage_name",
                                type: "string",
                            }),
                            new McmaModuleParameter({
                                name: "aws_account_id",
                                type: "string",
                            }),
                            new McmaModuleParameter({
                                name: "aws_region",
                                type: "string",
                            }),
                        ],
                    }),
                    new McmaModule({
                        id: repositoryUrl + "/aws_media_repository.zip",
                        provider: "ebu",
                        name: "aws_media_repository",
                        version: "0.0.1",
                        displayName: "AWS MCMA Media Repository",
                        description: "The MCMA Service Registry is used for tracking assets and their corresponding data files.",
                        inputParameters: [
                            new McmaModuleParameter({
                                name: "module_prefix",
                                type: "string",
                            }),
                            new McmaModuleParameter({
                                name: "stage_name",
                                type: "string",
                            }),
                            new McmaModuleParameter({
                                name: "aws_account_id",
                                type: "string",
                            }),
                            new McmaModuleParameter({
                                name: "aws_region",
                                type: "string",
                            }),
                        ],
                    }),
                ];
            }),
        );
    }
}
