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
import { FileSystemService } from '../../core/file-system.service';
import { ScanResult } from '../models/scan-result.interface';

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
export class ScanResultsComponent {
    private fileSystem = inject(FileSystemService);
    protected results = inject<ScanResult[]>(MAT_DIALOG_DATA);
    displayedColumns: string[] = ['path', 'reason'];

    protected openLocation(filePath: string) {
        this.fileSystem.showItemInFolder(filePath);
    }
}
