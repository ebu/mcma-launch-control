import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
    selector: "mcma-delete-project-dialog",
    templateUrl: "delete-project-dialog.component.html",
    styleUrls: ["delete-project-dialog.component.scss"],
})
export class DeleteProjectDialogComponent {

    @Input() projectName: string;

    constructor(protected ref: NbDialogRef<DeleteProjectDialogComponent>) {
    }

    cancel() {
        this.ref.close();
    }

    submit(name) {
        this.ref.close(name);
    }
}
