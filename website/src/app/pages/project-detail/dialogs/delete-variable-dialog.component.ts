import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { McmaVariable } from "@local/commons";

@Component({
    selector: "mcma-delete-variable-dialog",
    templateUrl: "delete-variable-dialog.component.html",
    styleUrls: ["delete-variable-dialog.component.scss"],
})
export class DeleteVariableDialogComponent {

    @Input() variable: McmaVariable;

    constructor(protected ref: NbDialogRef<DeleteVariableDialogComponent>) {
    }

    cancel() {
        this.ref.close();
    }

    submit() {
        this.ref.close(true);
    }
}
