import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { McmaComponent } from "commons";

@Component({
    selector: "mcma-delete-component-dialog",
    templateUrl: "delete-component-dialog.component.html",
    styleUrls: ["delete-component-dialog.component.scss"],
})
export class DeleteComponentDialogComponent {

    @Input() component: McmaComponent;

    constructor(protected ref: NbDialogRef<DeleteComponentDialogComponent>) {
    }

    cancel() {
        this.ref.close();
    }

    submit() {
        this.ref.close(true);
    }
}
