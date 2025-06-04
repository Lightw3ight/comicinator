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
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

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
        CdkDrag,
        CdkDragHandle,
    ],
})
export class ConfirmDeleteDialogComponent {
    protected bookTitle = inject<string>(MAT_DIALOG_DATA);
}
