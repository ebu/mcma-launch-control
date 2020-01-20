import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ModuleRepositoryData } from "../data/module-repository";
import { McmaModule } from "@local/commons";
import { ConfigService } from "../utils";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class ModuleRepositoryService extends ModuleRepositoryData {
    constructor(private http: HttpClient, private config: ConfigService) {
        super();
    }

    getNamespaces(): Observable<string[]> {
        return this.config.get<string>("repository_url").pipe(
            switchMap(repositoryUrl => this.http.get(repositoryUrl + "/index.json")),
            map(index => index["contents"].map(item => item.name)),
        );
    }

    getModules(namespace: string): Observable<string[]> {
        return this.config.get<string>("repository_url").pipe(
            switchMap(repositoryUrl => this.http.get(repositoryUrl + "/" + namespace + "/index.json")),
            map(index => index["contents"].map(item => item.name)),
        );
    }

    getVersions(namespace: string, module: string): Observable<string[]> {
        return this.config.get<string>("repository_url").pipe(
            switchMap(repositoryUrl => this.http.get(repositoryUrl + "/" + namespace + "/" + module + "/index.json")),
            map(index => index["contents"].map(item => item.name)),
        );
    }

    getModule(namespace: string, module: string, version: string): Observable<McmaModule> {
        let baseUrl;

        return this.config.get<string>("repository_url").pipe(
            switchMap(repositoryUrl => {
                baseUrl = repositoryUrl + "/" + namespace + "/" + module + "/" + version;
                return this.http.get(baseUrl + "/module.json");
            }),
            map(json => {
                const mcmaModule = new McmaModule(json);
                mcmaModule.id = baseUrl + "/module.json";
                mcmaModule.link = baseUrl + "/module.zip";
                return mcmaModule;
            }),
        );
    }
}
