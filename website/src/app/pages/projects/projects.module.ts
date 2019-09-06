import { NgModule } from "@angular/core";
import { NbCardModule, NbListModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { ProjectsComponent } from "./projects.component";
import { ProjectsRoutingModule } from "./projects-routing.module";

@NgModule({
    imports: [
        NbCardModule,
        ThemeModule,
        ProjectsRoutingModule,
        NbListModule,
    ],
    declarations: [
        ProjectsComponent,
    ],
})
export class ProjectsModule {
}
