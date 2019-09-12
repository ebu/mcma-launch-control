import { Observable } from "rxjs";

import { McmaModule } from "commons";

export abstract class ModuleRepositoryData {
    abstract getModules(): Observable<McmaModule[]>;
}
