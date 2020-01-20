import { Observable } from "rxjs";

import { McmaModule } from "@local/commons";

export abstract class ModuleRepositoryData {
    abstract getNamespaces(): Observable<string[]>;
    abstract getModules(namespace: string): Observable<string[]>;
    abstract getVersions(namespace: string, module: string): Observable<string[]>;
    abstract getModule(namespace: string, module: string, version: string): Observable<McmaModule>;
}
