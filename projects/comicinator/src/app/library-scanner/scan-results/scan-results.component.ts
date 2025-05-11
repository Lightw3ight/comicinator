import { Component, inject, OnInit } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ScanResult } from '../models/scan-result.interface';
import {MatTableModule} from '@angular/material/table';

@Component({
    selector: 'cmx-scan-results',
    templateUrl: 'scan-results.component.html',
    imports: [
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatTableModule,
    ],
})

export class ScanResultsComponent implements OnInit {
    protected results = inject<ScanResult[]>(MAT_DIALOG_DATA);
    displayedColumns: string[] = ['path', 'reason'];
    constructor() { }

    ngOnInit() { }
}