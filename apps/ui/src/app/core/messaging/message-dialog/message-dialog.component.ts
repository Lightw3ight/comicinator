import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MessageDialogOptions } from '../message-dialog-options.interface';

@Component({
    selector: 'cbx-message-dialog',
    templateUrl: 'message-dialog.component.html',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatButtonModule,
    ],
})
export class MessageDialogComponent {
    protected options = inject<MessageDialogOptions>(MAT_DIALOG_DATA);
}
