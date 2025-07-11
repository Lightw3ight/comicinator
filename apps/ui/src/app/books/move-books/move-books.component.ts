import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { FileSystemService } from '../../core/file-system.service';
import { Book } from '../../core/models/book.interface';
import { PathGeneratorService } from '../../core/path-generator.service';
import { BooksStore } from '../../core/store/books/books.store';
import { ErrorResult } from '../../shared/error-list/error-result.interface';
import { ErrorResultsComponent } from '../../shared/error-list/error-results.component';
import { ProgressTakeoverComponent } from '../../shared/progress-takeover/progress-takeover.component';
import { MoveBookItem } from './move-book-item.interface';

@Component({
    selector: 'cbx-move-books',
    templateUrl: 'move-books.component.html',
    styleUrl: 'move-books.component.scss',
    imports: [
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        CdkDrag,
        CdkDragHandle,
        MatCheckbox,
        ProgressTakeoverComponent,
    ],
})
export class MoveBooksComponent {
    private books = inject<Book[]>(MAT_DIALOG_DATA);
    private pathGeneratorService = inject(PathGeneratorService);
    private fileSystem = inject(FileSystemService);
    private bookStore = inject(BooksStore);
    private dialog = inject(MatDialog);
    private dialogRef = inject(MatDialogRef<MoveBooksComponent>);

    protected items = signal(this.createMoveBookItems());
    private completionCount = signal(0);
    protected progress = this.computeProgress();
    protected progressText = signal('Initializing');
    protected processing = signal(false);
    protected canMove = this.computeCanMove();

    protected async moveBooks() {
        const errors: ErrorResult[] = [];
        const itemsToMove = this.items().filter((o) => o.selected);

        this.processing.set(true);

        for (const item of itemsToMove) {
            this.progressText.set(`Moving ${item.book.title} to destination`);

            const exists = await this.fileSystem.exists(item.outputPath);

            if (!exists) {
                try {
                    await this.fileSystem.moveFile(
                        item.book.filePath,
                        item.outputPath,
                    );
                } catch (err: any) {
                    errors.push({
                        filePath: item.book.filePath,
                        error: `Failed to move book to, ${item.outputPath}.`,
                    });
                    this.completionCount.set(this.completionCount() + 1);
                    continue;
                }

                try {
                    await this.bookStore.updateBook({
                        ...item.book,
                        filePath: item.outputPath,
                    });
                } catch (err: any) {
                    errors.push({
                        filePath: item.book.filePath,
                        error: `Failed to update database with new file path, ${item.outputPath}.`,
                    });
                    await this.fileSystem.moveFile(
                        item.outputPath,
                        item.book.filePath,
                    );
                    this.completionCount.set(this.completionCount() + 1);
                    continue;
                }
            } else {
                errors.push({
                    filePath: item.book.filePath,
                    error: `Destination file, ${item.outputPath} ,already exists.`,
                });
            }
            this.completionCount.set(this.completionCount() + 1);
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

    protected setItemSelected(item: MoveBookItem, selected: boolean) {
        const items = [...this.items()];
        const ix = items.indexOf(item);

        items.splice(ix, 1, {
            ...item,
            selected,
        });
        this.items.set(items);
    }

    private computeCanMove() {
        return computed(() => {
            return this.items().filter((o) => o.selected).length > 0;
        });
    }

    private createMoveBookItems() {
        return this.books.map<MoveBookItem>((book) => {
            const outputPath = this.pathGeneratorService.generatePath(book);
            const samePath =
                outputPath.toLocaleLowerCase() ===
                book.filePath.toLocaleLowerCase();
            return {
                selected: !samePath,
                book,
                outputPath,
                samePath,
            };
        });
    }

    private computeProgress() {
        return computed(() => {
            const itemCount = this.items().filter((o) => o.selected).length;

            return Math.floor((this.completionCount() / itemCount) * 100);
        });
    }
}
