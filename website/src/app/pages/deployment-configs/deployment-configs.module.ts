import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbDialogModule, NbInputModule, NbListModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { DeploymentConfigsComponent } from "./deployment-configs.component";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { AddDeploymentConfigDialogComponent } from "./dialogs/add-deployment-config-dialog.component";
import { DeleteDeploymentConfigDialogComponent } from "./dialogs/delete-deployment-config-dialog.component";

@NgModule({
    imports: [
        NbButtonModule,
        NbCardModule,
        NbDialogModule.forChild(),
        NbListModule,
        NbInputModule,
        Ng2SmartTableModule,
        ThemeModule,
        NbCheckboxModule,
    ],
    declarations: [
        AddDeploymentConfigDialogComponent,
        DeleteDeploymentConfigDialogComponent,
        DeploymentConfigsComponent,
    ],
    entryComponents: [
        DeleteDeploymentConfigDialogComponent,
        AddDeploymentConfigDialogComponent,
    ],
})
export class DeploymentConfigsModule {
}
