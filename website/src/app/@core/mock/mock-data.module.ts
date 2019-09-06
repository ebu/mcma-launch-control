import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UserService } from "./users.service";
import { LaunchControlService } from "./launch-control.service";

const SERVICES = [
    UserService,
    LaunchControlService,
];

@NgModule({
    imports: [
        CommonModule,
    ],
    providers: [
        ...SERVICES,
    ],
})
export class MockDataModule {
    static forRoot(): ModuleWithProviders {
        return <ModuleWithProviders>{
            ngModule: MockDataModule,
            providers: [
                ...SERVICES,
            ],
        };
    }
}
