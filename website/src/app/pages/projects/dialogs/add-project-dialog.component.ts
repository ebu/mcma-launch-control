import { Component } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "mcma-add-project-dialog",
  templateUrl: "add-project-dialog.component.html",
  styleUrls: ["add-project-dialog.component.scss"],
})
export class AddProjectDialogComponent {

  constructor(protected ref: NbDialogRef<AddProjectDialogComponent>) {}

  cancel() {
    this.ref.close();
  }

  submit(name, displayName) {
    this.ref.close({ name, displayName });
  }
}
