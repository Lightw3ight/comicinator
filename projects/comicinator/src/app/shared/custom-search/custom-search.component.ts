import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'cbx-custom-search',
    templateUrl: 'custom-search.component.html',
    styleUrl: 'custom-search.component.scss',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatButton,
        MatFormField,
        MatInput,
        MatLabel,
        CdkDrag,
        CdkDragHandle,
        FormsModule,
    ],
})
export class CustomSearchComponent {
    private initialSearch = inject<string>(MAT_DIALOG_DATA);

    protected searchValue = signal(this.initialSearch);
}
