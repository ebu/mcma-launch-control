import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbInputModule, NbSelectModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { DeploymentConfigDetailComponent } from "./deployment-config-detail.component";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { FormsModule } from "@angular/forms";
import { EditVariableDialogComponent } from "./dialogs/edit-variable-dialog.component";
import { DeleteVariableDialogComponent } from "./dialogs/delete-variable-dialog.component";

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
        DeploymentConfigDetailComponent,
        EditVariableDialogComponent,
        DeleteVariableDialogComponent,
    ],
    entryComponents: [
        EditVariableDialogComponent,
        DeleteVariableDialogComponent,
    ],
})
export class DeploymentConfigDetailModule {
}
