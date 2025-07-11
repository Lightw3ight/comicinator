import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { FileSystemService } from '../../core/file-system.service';
import { ImporterService } from '../../core/importers/importer.service';
import { BooksStore } from '../../core/store/books/books.store';
import { ErrorResult } from '../../shared/error-list/error-result.interface';
import { ErrorResultsComponent } from '../../shared/error-list/error-results.component';
import { ImportItem } from '../import-item.interface';
import { MessagingService } from '../../core/messaging/messaging.service';

@Component({
    selector: 'cbx-import-progress',
    templateUrl: 'import-progress.component.html',
    styleUrl: 'import-progress.component.scss',
    imports: [
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatProgressSpinnerModule,
    ],
})
export class ImportProgressComponent implements OnInit {
    private importItems = inject<ImportItem[]>(MAT_DIALOG_DATA);
    private fileSystem = inject(FileSystemService);
    private booksStore = inject(BooksStore);
    private dialogRef = inject(MatDialogRef<ImportProgressComponent>);
    private dialog = inject(MatDialog);
    private importerService = inject(ImporterService);
    private messagingService = inject(MessagingService);

    private completionCount = signal(0);
    protected progress = this.computeProgress();
    protected progressText = signal('Initializing');
    protected cancelled = signal(false);

    public async ngOnInit() {
        this.begin();
    }

    async begin() {
        const errors: ErrorResult[] = [];

        for (const item of this.importItems) {
            if (this.cancelled()) {
                break;
            }

            this.progressText.set(`Moving ${item.name} to destination`);
            try {
                const destinationExists = await this.fileSystem.exists(
                    item.outputPath,
                );

                if (destinationExists) {
                    const overwrite = await this.messagingService.confirm(
                        'Overwrite existing book',
                        `The file ${item.outputPath} already exists, do you want to overwrite it?`,
                    );

                    if (!overwrite) {
                        errors.push({
                            filePath: item.filePath,
                            error: `Destination file, ${item.outputPath} ,already exists.`,
                        });
                        continue;
                    }
                }

                await this.fileSystem.moveFile(item.filePath, item.outputPath);
            } catch (err: any) {
                errors.push({ filePath: item.filePath, error: err.toString() });
                this.completionCount.update((val) => val + 1);
                continue;
            }

            try {
                await this.createBook(item);
            } catch (err: any) {
                errors.push({ filePath: item.filePath, error: err.toString() });
            }

            this.completionCount.update((val) => val + 1);

            if (this.cancelled()) {
                break;
            }
        }

        if (errors.length) {
            const ref = this.dialog.open(ErrorResultsComponent, {
                minWidth: 750,
                data: errors,
            });
            await firstValueFrom(ref.afterClosed());
        }

        this.dialogRef.close();
    }

    protected cancel() {
        this.cancelled.set(true);
    }

    private async createBook(item: ImportItem) {
        if (item.issue && item.volume) {
            this.progressText.set(
                `Scanning API for information on ${item.name}`,
            );
            const { book, characterIds, teamIds, locationIds } =
                await this.importerService.importBook(item.issue, item.volume);

            this.progressText.set(`Adding ${item.name} to library`);
            await this.booksStore.insertBook(
                {
                    ...book,
                    filePath: item.outputPath,
                    title: book.title!,
                },
                characterIds,
                teamIds,
                locationIds,
            );
        } else {
            this.progressText.set(`Adding ${item.name} to library`);
            await this.booksStore.insertBook(
                {
                    filePath: item.outputPath,
                    series: item.name,
                    title: item.name,
                },
                [],
                [],
                [],
            );
        }
    }

    private computeProgress() {
        return computed(() => {
            return Math.floor(
                (this.completionCount() / this.importItems.length) * 100,
            );
        });
    }
}
