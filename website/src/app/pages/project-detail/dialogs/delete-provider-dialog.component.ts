import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { McmaProvider } from "@local/commons";

@Component({
    selector: "mcma-delete-provider-variable-dialog",
    templateUrl: "delete-provider-dialog.component.html",
    styleUrls: ["delete-provider-dialog.component.scss"],
})
export class DeleteProviderDialogComponent {

    @Input() provider: McmaProvider;

    constructor(protected ref: NbDialogRef<DeleteProviderDialogComponent>) {
    }

    cancel() {
        this.ref.close();
    }

    submit() {
        this.ref.close(true);
    }
}
