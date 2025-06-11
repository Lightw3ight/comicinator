import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ErrorResult } from './error-result.interface';

@Component({
    selector: 'cmx-error-results',
    templateUrl: 'error-results.component.html',
    imports: [
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatTableModule,
    ],
})
export class ErrorResultsComponent {
    protected results = inject<ErrorResult[]>(MAT_DIALOG_DATA);
    displayedColumns: string[] = ['filePath', 'error'];
}
