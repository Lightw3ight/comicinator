import { Component, effect, inject, signal, viewChild } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ComicVineService } from '../../../core/api/comic-vine/comic-vine-api.service';
import { BookResult } from '../../../core/api/comic-vine/models/book-result.interface';

import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { VolumeResult } from '../../../core/api/comic-vine/models/volume-result.interface';
import { MessagingService } from '../../../core/messaging/messaging.service';
import { SelectIssueComponent } from '../select-issue/select-issue.component';
import { BookListItem } from './book-list-item.interface';
import { bookThumbSrc } from '../../../shared/book-thumb-path';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
    selector: 'cbx-book-search-results',
    templateUrl: 'book-search-results.component.html',
    styleUrl: 'book-search-results.component.scss',
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
export class BookSearchResultsComponent {
    private comicVineService = inject(ComicVineService);
    private dialogRef = inject(MatDialogRef<BookSearchResultsComponent>);
    private dialog = inject(MatDialog);
    private messagingService = inject(MessagingService);

    protected displayedColumns = [
        // 'id',
        'name',
        'publisher',
        'issueCount',
        'startYear',
    ];
    protected searchParams = inject<{
        series: string;
        number: string;
        volume: string;
        filePath: string;
    }>(MAT_DIALOG_DATA);
    protected results = signal<MatTableDataSource<BookListItem>>(
        new MatTableDataSource<BookListItem>([]),
    );
    protected loading = signal(true);
    protected selectedItem = signal<VolumeResult | undefined>(undefined);
    private sort = viewChild(MatSort);
    protected completingSelection = signal(false);
    protected selectedIssue = signal<BookResult | undefined>(undefined);
    protected fileThumbPath = this.getFileThumbPath();

    private getFileThumbPath() {
        if (this.searchParams.filePath) {
            return bookThumbSrc(this.searchParams.filePath);
        }

        return undefined;
    }

    constructor() {
        effect(async () => {
            const sort = this.sort();
            if (sort) {
                await this.search(this.searchParams.series);
            }
        });
    }

    protected async openIssuesDialog() {
        const ref = this.dialog.open(SelectIssueComponent, {
            data: { volume: this.selectedItem()!.id },
            minWidth: 750,
        });

        const issue = await firstValueFrom(ref.afterClosed());

        if (issue) {
            this.dialogRef.close({ issue, volume: this.selectedItem() });
        }
    }

    protected async selectItem(item: VolumeResult) {
        if (this.completingSelection()) {
            return;
        }

        this.selectedItem.set(item);
        const message = () => `Failed searching for book id ${item.id}, retry?`;
        const response = await this.messagingService.runWithRetry(
            () =>
                this.comicVineService.searchBooks(
                    undefined,
                    item.id,
                    undefined,
                ),
            message,
        );

        if (response == null) {
            throw new Error(`Failed to fetch book details for ${item.id}`);
        }

        if (this.selectedItem() === item) {
            const issue =
                response.results.find(
                    (i) =>
                        Number(i.issueNumber) ===
                        Number(this.searchParams.number),
                ) ?? response.results[0];
            this.selectedIssue.set(issue);
        }
    }

    protected async selectCurrent() {
        const selection = this.selectedIssue();

        if (selection) {
            this.completingSelection.set(true);

            const message = () =>
                `Failed to load book info for ${selection.name}, Retry?`;
            const apiResult = await this.messagingService.runWithRetry(
                () => this.comicVineService.getBook(selection.id),
                message,
            );

            if (apiResult) {
                this.dialogRef.close({
                    issue: apiResult,
                    volume: this.selectedItem(),
                });
            } else {
                this.dialogRef.close();
            }
        }
    }

    private async search(search: string) {
        this.loading.set(true);
        const message = () =>
            `Failed to load search results for ${search}, Retry?`;
        let results = await this.messagingService.runWithRetry(
            () => this.comicVineService.searchVolumes(search),
            message,
        );

        if (results == null) {
            this.dialogRef.close();
            return;
        }

        const listItems = results.map((r) => this.mapToListItem(r));
        this.results.set(new MatTableDataSource(listItems));
        this.results().sort = this.sort()!;
        if (listItems.length) {
            listItems.sort((a, b) => Number(b.startYear) - Number(a.startYear));

            await this.preSelect(listItems);
        }
        this.loading.set(false);
    }

    private async preSelect(listItems: BookListItem[]) {
        const nameMatches =
            listItems.filter(
                (o) =>
                    o.data.name.toLocaleLowerCase() ===
                    this.searchParams.series.toLocaleLowerCase(),
            ) ?? listItems[0];

        let match = nameMatches.find(
            (o) => o.data.startYear === this.searchParams.volume,
        );

        if (match == null) {
            match = nameMatches[0] ?? listItems[0];
        }

        await this.selectItem(match?.data);
    }

    private mapToListItem(result: VolumeResult): BookListItem {
        return {
            id: result.id,
            name: result.name,
            issueCount: result.issueCount,
            publisher: result.publisher?.name,
            startYear: result.startYear,
            data: result,
        };
    }
}
