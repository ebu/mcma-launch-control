import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
    selector: "mcma-edit-variable-dialog",
    templateUrl: "edit-variable-dialog.component.html",
    styleUrls: ["edit-variable-dialog.component.scss"],
})
export class EditVariableDialogComponent implements OnInit {

    @Input() variable: { name: string, value: string };

    action: string = "Add";

    name: string;
    value: string;

    constructor(protected ref: NbDialogRef<EditVariableDialogComponent>) {
    }

    cancel() {
        this.ref.close();
    }

    submit() {
        this.ref.close({ name: this.name, value: this.value });
    }

    ngOnInit(): void {
        this.name = this.variable.name;
        this.value = this.variable.value;
    }
}

