import { ModuleWithProviders, NgModule, Optional, SkipSelf } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NbAuthModule, NbDummyAuthStrategy } from "@nebular/auth";
import { NbSecurityModule, NbRoleProvider } from "@nebular/security";
import { of as observableOf } from "rxjs";

import { throwIfAlreadyLoaded } from "./module-import-guard";
import { AnalyticsService, ConfigService } from "./utils";
import { UserData } from "./data/users";
import { LaunchControlData } from "./data/launch-control";
import { UserService } from "./api/users.service";
import { LaunchControlService } from "./api/launch-control.service";
import { ApiDataModule } from "./api/api-data.module";
import { ModuleRepositoryService } from "./api/module-repository.service";
import { ModuleRepositoryData } from "./data/module-repository";

const socialLinks = [
    {
        url: "https://github.com/akveo/nebular",
        target: "_blank",
        icon: "github",
    },
    {
        url: "https://www.facebook.com/akveo/",
        target: "_blank",
        icon: "facebook",
    },
    {
        url: "https://twitter.com/akveo_inc",
        target: "_blank",
        icon: "twitter",
    },
];

const DATA_SERVICES = [
    { provide: UserData, useClass: UserService },
    { provide: LaunchControlData, useClass: LaunchControlService },
    { provide: ModuleRepositoryData, useClass: ModuleRepositoryService },
];

export class NbSimpleRoleProvider extends NbRoleProvider {
    getRole() {
        // here you could provide any role based on any auth flow
        return observableOf("guest");
    }
}

export const NB_CORE_PROVIDERS = [
    ...ApiDataModule.forRoot().providers,
    ...DATA_SERVICES,
    ...NbAuthModule.forRoot({

        strategies: [
            NbDummyAuthStrategy.setup({
                name: "email",
                delay: 3000,
            }),
        ],
        forms: {
            login: {
                socialLinks: socialLinks,
            },
            register: {
                socialLinks: socialLinks,
            },
        },
    }).providers,

    NbSecurityModule.forRoot({
        accessControl: {
            guest: {
                view: "*",
            },
            user: {
                parent: "guest",
                create: "*",
                edit: "*",
                remove: "*",
            },
        },
    }).providers,

    {
        provide: NbRoleProvider, useClass: NbSimpleRoleProvider,
    },
    AnalyticsService,
    ConfigService,
];

@NgModule({
    imports: [
        CommonModule,
    ],
    exports: [
        NbAuthModule,
    ],
    declarations: [],
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        throwIfAlreadyLoaded(parentModule, "CoreModule");
    }

    static forRoot(): ModuleWithProviders {
        return <ModuleWithProviders>{
            ngModule: CoreModule,
            providers: [
                ...NB_CORE_PROVIDERS,
            ],
        };
    }
}
