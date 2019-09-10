import { NgModule } from "@angular/core";
import { NbCardModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { ProjectDetailComponent } from "./project-detail.component";

@NgModule({
    imports: [
        NbCardModule,
        ThemeModule,
    ],
    declarations: [
        ProjectDetailComponent,
    ],
})
export class ProjectDetailModule {
}
