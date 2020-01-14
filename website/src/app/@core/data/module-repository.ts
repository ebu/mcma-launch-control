import { Observable } from "rxjs";

import { McmaModule } from "@local/commons";

export abstract class ModuleRepositoryData {
    abstract getProviders(): Observable<string[]>;
    abstract getModules(provider: string): Observable<string[]>;
    abstract getVersions(provider: string, module: string): Observable<string[]>;
    abstract getModule(provider: string, module: string, version: string): Observable<McmaModule>;
}
