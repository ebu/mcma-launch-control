import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
    selector: "mcma-delete-variable-dialog",
    templateUrl: "delete-variable-dialog.component.html",
    styleUrls: ["delete-variable-dialog.component.scss"],
})
export class DeleteVariableDialogComponent {

    @Input() variable: { name: string, value: string};

    constructor(protected ref: NbDialogRef<DeleteVariableDialogComponent>) {
    }

    cancel() {
        this.ref.close();
    }

    submit() {
        this.ref.close(true);
    }
}
