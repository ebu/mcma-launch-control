import { Observable } from "rxjs";

import { McmaModule } from "@local/commons";

export abstract class ModuleRepositoryData {
    abstract getModules(): Observable<McmaModule[]>;
}
