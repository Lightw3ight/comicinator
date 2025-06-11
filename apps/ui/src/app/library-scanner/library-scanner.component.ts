import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
    MatDialog,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { firstValueFrom } from 'rxjs';
import { ElectronService } from '../core/electron.service';
import { FileSystemService } from '../core/file-system.service';
import { ComicInfoXml } from '../core/models/comic-info-xml.interface';
import { BooksStore } from '../core/store/books/books.store';
import { SettingsStore } from '../core/store/settings/settings.store';
import { ScanResult } from './models/scan-result.interface';
import { ScanResultsComponent } from './scan-results/scan-results.component';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
    selector: 'cmx-library-scanner',
    templateUrl: 'library-scanner.component.html',
    styleUrl: 'library-scanner.component.scss',
    imports: [
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatProgressBarModule,
        MatCheckboxModule,
        CdkDrag,
        CdkDragHandle,
    ],
})
export class LibraryScannerComponent {
    private fileSystemService = inject(FileSystemService);
    private electronService = inject(ElectronService);
    private settingsStore = inject(SettingsStore);
    private booksStore = inject(BooksStore);
    private dialogRef = inject(MatDialogRef<LibraryScannerComponent>);
    private dialog = inject(MatDialog);

    protected readonly processing = signal(false);
    protected readonly scanning = signal(false);

    protected readonly fileCount = signal(0);
    protected readonly filesProcessed = signal(0);
    protected readonly progress = this.computeProgress();
    protected readonly progressText = signal('');
    protected readonly canceling = signal(false);
    protected checkForXml = signal(true);

    protected async startScan() {
        const path = this.settingsStore.settings.libraryPath();

        if (path) {
            this.progressText.set(`Scanning library path: ${path}`);
            this.processing.set(true);
            this.scanning.set(true);

            const files = await this.fileSystemService.getFolderContents(
                path,
                true,
            );

            this.scanning.set(false);

            if (files.length > 0) {
                const results = await this.processFiles(files);

                if (results.some((r) => r.error)) {
                    await this.showResults(results);
                }
            }

            this.processing.set(false);

            this.dialogRef.close();
        }
    }

    protected cancel() {
        if (!this.processing()) {
            this.dialogRef.close();
        } else {
            this.canceling.set(true);
        }
    }

    private async showResults(results: ScanResult[]) {
        const ref = this.dialog.open(ScanResultsComponent, {
            data: results.filter((o) => o.error),
        });

        await firstValueFrom(ref.afterClosed());
    }

    private async processFiles(filePaths: string[]) {
        this.fileCount.set(filePaths.length);
        const results: ScanResult[] = [];

        for (let path of filePaths) {
            if (await this.booksStore.checkComicAdded(path)) {
                results.push({
                    added: false,
                    reason: 'File already exists',
                    path,
                });
                this.filesProcessed.update((val) => val + 1);
                continue;
            }

            this.progressText.set(
                `Adding file (${this.filesProcessed() + 1} of ${filePaths.length}): ${path}`,
            );

            try {
                const comicInfo =
                    await this.electronService.zipImportBook(path);
                await this.booksStore.importBook(path, comicInfo);

                results.push({
                    added: true,
                    reason: 'Added',
                    path,
                });
            } catch (err: any) {
                results.push({
                    added: false,
                    error: true,
                    reason: err.toString(),
                    path,
                });
            }

            this.filesProcessed.update((val) => val + 1);

            if (this.canceling()) {
                break;
            }
        }

        if (this.canceling()) {
            this.dialogRef.close();
        }

        return results;
    }

    private computeProgress() {
        return computed(() => {
            return (this.filesProcessed() / this.fileCount()) * 100;
        });
    }
}
