import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbListModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { ProjectsComponent } from "./projects.component";
import { ProjectsRoutingModule } from "./projects-routing.module";
import { Ng2SmartTableModule } from "ng2-smart-table";

@NgModule({
    imports: [
        NbCardModule,
        ThemeModule,
        ProjectsRoutingModule,
        NbListModule,
        NbButtonModule,
        Ng2SmartTableModule,
    ],
    declarations: [
        ProjectsComponent,
    ],
})
export class ProjectsModule {
}
