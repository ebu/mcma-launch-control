import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UserService } from "./users.service";
import { LaunchControlService } from "./launch-control.service";
import { ModuleRepositoryService } from "./module-repository.service";

const SERVICES = [
    UserService,
    LaunchControlService,
    ModuleRepositoryService,
];

@NgModule({
    imports: [
        CommonModule,
    ],
    providers: [
        ...SERVICES,
    ],
})
export class ApiDataModule {
    static forRoot(): ModuleWithProviders {
        return <ModuleWithProviders>{
            ngModule: ApiDataModule,
            providers: [
                ...SERVICES,
            ],
        };
    }
}
