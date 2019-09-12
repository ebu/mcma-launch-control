import { Component } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "mcma-add-deployment-config-dialog",
  templateUrl: "add-deployment-config-dialog.component.html",
  styleUrls: ["add-deployment-config-dialog.component.scss"],
})
export class AddDeploymentConfigDialogComponent {

  constructor(protected ref: NbDialogRef<AddDeploymentConfigDialogComponent>) {}

  cancel() {
    this.ref.close();
  }

  submit(name, displayName) {
    this.ref.close({ name, displayName });
  }
}
