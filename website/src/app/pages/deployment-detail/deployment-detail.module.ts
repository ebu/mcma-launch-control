import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbInputModule, NbSelectModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { DeploymentDetailComponent } from "./deployment-detail.component";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { FormsModule } from "@angular/forms";
import { ViewDeployedComponentDialogComponent } from "./dialogs/view-deployed-component-dialog.component";
import { ViewProviderDialogComponent } from "./dialogs/view-provider-dialog.component";

@NgModule({
    imports: [
        NbCardModule,
        ThemeModule,
        Ng2SmartTableModule,
        NbButtonModule,
        NbInputModule,
        NbSelectModule,
        FormsModule,
        NbCheckboxModule,
    ],
    declarations: [
        DeploymentDetailComponent,
        ViewDeployedComponentDialogComponent,
        ViewProviderDialogComponent,
    ],
    entryComponents: [
        ViewDeployedComponentDialogComponent,
        ViewProviderDialogComponent,
    ],
})
export class DeploymentDetailModule {
}
