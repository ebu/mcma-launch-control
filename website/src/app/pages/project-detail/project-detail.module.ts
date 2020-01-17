import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbInputModule, NbSelectModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { ProjectDetailComponent } from "./project-detail.component";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { EditComponentDialogComponent } from "./dialogs/edit-component-dialog.component";
import { FormsModule } from "@angular/forms";
import { DeleteComponentDialogComponent } from "./dialogs/delete-component-dialog.component";
import { DeleteVariableDialogComponent } from "./dialogs/delete-variable-dialog.component";
import { EditVariableDialogComponent } from "./dialogs/edit-variable-dialog.component";

@NgModule({
    imports: [
        NbCardModule,
        ThemeModule,
        Ng2SmartTableModule,
        NbButtonModule,
        NbInputModule,
        NbSelectModule,
        FormsModule,
    ],
    declarations: [
        ProjectDetailComponent,
        EditComponentDialogComponent,
        DeleteComponentDialogComponent,
        EditVariableDialogComponent,
        DeleteVariableDialogComponent,
    ],
    entryComponents: [
        EditComponentDialogComponent,
        DeleteComponentDialogComponent,
        EditVariableDialogComponent,
        DeleteVariableDialogComponent,
    ],
})
export class ProjectDetailModule {
}
