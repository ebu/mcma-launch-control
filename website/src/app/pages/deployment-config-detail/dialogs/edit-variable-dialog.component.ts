import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { McmaVariable } from "@local/commons";

@Component({
    selector: "mcma-edit-variable-dialog",
    templateUrl: "edit-variable-dialog.component.html",
    styleUrls: ["edit-variable-dialog.component.scss"],
})
export class EditVariableDialogComponent implements OnInit {

    @Input() variable: McmaVariable;

    action: string = "Add";

    name: string;
    value: string;
    secure: boolean;

    constructor(protected ref: NbDialogRef<EditVariableDialogComponent>) {
    }

    cancel() {
        this.ref.close();
    }

    submit() {
        this.ref.close(new McmaVariable({ name: this.name, value: this.value, secure: this.secure }));
    }

    ngOnInit() {
        this.action = this.variable.name ? "Edit" : "Add";
        this.name = this.variable.name;
        this.value = this.variable.value;
        this.secure = this.variable.secure;
    }
}

