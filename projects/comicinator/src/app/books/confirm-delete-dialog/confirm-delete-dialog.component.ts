import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'cbx-confirm-delete-dialog',
    templateUrl: 'confirm-delete-dialog.component.html',
    styleUrl: 'confirm-delete-dialog.component.scss',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatButtonModule,
        MatCheckbox,
    ],
})
export class ConfirmDeleteDialogComponent {
    protected bookTitle = inject<string>(MAT_DIALOG_DATA);
}
