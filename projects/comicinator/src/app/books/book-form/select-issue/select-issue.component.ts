import {
    Component,
    computed,
    effect,
    inject,
    signal,
    viewChild,
} from '@angular/core';

import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';

import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ComicVineService } from '../../../core/api/comic-vine/comic-vine-api.service';
import { BookResult } from '../../../core/api/comic-vine/models/book-result.interface';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
    selector: 'cbx-select-issue',
    templateUrl: 'select-issue.component.html',
    styleUrl: 'select-issue.component.scss',
    imports: [
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatDialogTitle,
        MatTableModule,
        MatButton,
        MatSortModule,
        MatProgressBar,
        CdkDrag,
    ],
})
export class SelectIssueComponent {
    private comicVineService = inject(ComicVineService);
    private dialogRef = inject(MatDialogRef<SelectIssueComponent>);
    protected searchParams = inject<{ volume: string }>(MAT_DIALOG_DATA);
    protected displayedColumns = ['issueNumber', 'name'];
    protected completingSelection = signal(false);

    protected dataSource = new MatTableDataSource<BookResult>();

    // protected results = signal<MatTableDataSource<BookResult>>(
    //     new MatTableDataSource<BookResult>([])
    // );

    protected books = signal<BookResult[]>([]);
    protected totalResultCount = signal(0);
    protected showLoadMore = this.computeShowLoadMore();

    constructor() {
        effect(async () => {
            const sort = this.sort();
            if (sort) {
                await this.search();
            }
        });
    }

    protected loading = signal(true);
    protected selectedItem = signal<BookResult | undefined>(undefined);
    private sort = viewChild(MatSort);

    protected async selectCurrent() {
        const selection = this.selectedItem();

        if (selection) {
            this.completingSelection.set(true);
            try {
                const apiResult = await this.comicVineService.getBook(
                    selection.id,
                );
                this.dialogRef.close(apiResult);
            } catch {
                // TODO: show error
                this.completingSelection.set(false);
            }
        }
    }

    protected async loadMore() {
        this.loading.set(true);
        const response = await this.comicVineService.searchBooks(
            undefined,
            this.searchParams.volume,
            undefined,
            this.books().length,
        );
        const books = [...this.books(), ...response.results].sort(
            (a, b) => Number(a.issueNumber) - Number(b.issueNumber),
        );

        this.books.set(books);
        this.dataSource.data = books;
        this.loading.set(false);
    }

    private async search() {
        this.loading.set(true);

        const response = await this.comicVineService.searchBooks(
            undefined,
            this.searchParams.volume,
            undefined,
        );
        const books = response.results.sort(
            (a, b) => Number(a.issueNumber) - Number(b.issueNumber),
        );

        this.books.set(books);
        this.totalResultCount.set(response.totalResults);
        this.dataSource.data = books;
        this.dataSource.sort = this.sort()!;

        if (books.length) {
            this.selectedItem.set(books[0]);
        }
        this.loading.set(false);
    }

    private computeShowLoadMore() {
        return computed(() => {
            const books = this.books();
            const total = this.totalResultCount();

            return total > books.length && !this.loading();
        });
    }
}
