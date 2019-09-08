import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbDialogModule, NbInputModule, NbListModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { ProjectsComponent } from "./projects.component";
import { ProjectsRoutingModule } from "./projects-routing.module";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { AddProjectDialogComponent } from "./dialogs/add-project-dialog.component";
import { DeleteProjectDialogComponent } from "./dialogs/delete-project-dialog.component";

@NgModule({
    imports: [
        NbButtonModule,
        NbCardModule,
        NbDialogModule.forChild(),
        NbListModule,
        NbInputModule,
        Ng2SmartTableModule,
        ProjectsRoutingModule,
        ThemeModule,
        NbCheckboxModule,
    ],
    declarations: [
        AddProjectDialogComponent,
        DeleteProjectDialogComponent,
        ProjectsComponent,
    ],
    entryComponents: [
        DeleteProjectDialogComponent,
        AddProjectDialogComponent,
    ],
})
export class ProjectsModule {
}
