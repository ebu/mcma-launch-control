import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
    selector: "mcma-delete-project-dialog",
    templateUrl: "delete-deployment-config-dialog.component.html",
    styleUrls: ["delete-deployment-config-dialog.component.scss"],
})
export class DeleteDeploymentConfigDialogComponent {

    @Input() code: string;
    @Input() displayName: string;

    constructor(protected ref: NbDialogRef<DeleteDeploymentConfigDialogComponent>) {
    }

    cancel() {
        this.ref.close();
    }

    submit(name) {
        this.ref.close(name);
    }
}
