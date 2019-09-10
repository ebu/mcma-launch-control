import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbIconModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { ProjectDetailComponent } from "./project-detail.component";
import { Ng2SmartTableModule } from "ng2-smart-table";

@NgModule({
    imports: [
        NbCardModule,
        ThemeModule,
        Ng2SmartTableModule,
        NbButtonModule,
        NbIconModule,
    ],
    declarations: [
        ProjectDetailComponent,
    ],
})
export class ProjectDetailModule {
}
