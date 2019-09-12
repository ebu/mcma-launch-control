import { NgModule } from "@angular/core";
import { NbMenuModule } from "@nebular/theme";

import { ThemeModule } from "../@theme/theme.module";
import { PagesComponent } from "./pages.component";
import { DashboardModule } from "./dashboard/dashboard.module";
import { ProjectsModule } from "./projects/projects.module";
import { PagesRoutingModule } from "./pages-routing.module";
import { ProjectDetailModule } from "./project-detail/project-detail.module";
import { DeploymentConfigsModule } from "./deployment-configs/deployment-configs.module";

@NgModule({
    imports: [
        PagesRoutingModule,
        ThemeModule,
        NbMenuModule,
        DashboardModule,
        ProjectsModule,
        ProjectDetailModule,
        DeploymentConfigsModule,
    ],
    declarations: [
        PagesComponent,
    ],
})
export class PagesModule {
}
