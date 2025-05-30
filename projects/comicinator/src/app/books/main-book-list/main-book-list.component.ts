import {
    Component,
    effect,
    inject,
    input,
    signal,
    untracked,
} from '@angular/core';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';

import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BooksStore } from '../../core/store/books/books.store';
import { ThumbnailDataSource } from '../thumbnail-data-source';
import { StreamingThumbListComponent } from '../../shared/streaming-thumb-list/streaming-thumb-list.component';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';

@Component({
    selector: 'cbx-main-book-list',
    templateUrl: 'main-book-list.component.html',
    styleUrl: 'main-book-list.component.scss',
    imports: [
        StreamingThumbListComponent,
        ThumbListItemTemplateDirective,
        BookListItemComponent,
        RouterLink,
    ],
})
export class MainBookListComponent {
    private booksStore = inject(BooksStore);

    public readonly search = input<string>();

    protected readonly pagedData$ = toObservable(this.booksStore.pagedData);
    protected readonly dataSource = signal<
        ThumbnailDataSource<number> | undefined
    >(undefined);
    private readonly columnCount = signal(0);

    constructor() {
        effect(async () => {
            const search = this.search();
            const columnCount = this.columnCount();
            this.booksStore.sortField();
            this.booksStore.sortDirection();

            untracked(async () => {
                if (columnCount > 0) {
                    this.booksStore.setColumnCount(columnCount);

                    if (search?.length) {
                        this.booksStore.setSearch(search);
                    } else {
                        this.booksStore.clearSearch();
                    }
                    await this.booksStore.resetPageData();

                    console.log('Refreshing data');
                    this.reloadDataSource();
                }
            });
        });
    }

    protected async onColumnCountChange(count: number) {
        this.columnCount.set(count);
    }

    private reloadDataSource() {
        if (this.dataSource()) {
            this.dataSource.set(undefined);
        }

        setTimeout(() => this.dataSource.set(this.createDataSource()));
    }

    private createDataSource() {
        return new ThumbnailDataSource(this.pagedData$, (pageIndex) =>
            this.booksStore.loadPage(pageIndex),
        );
    }
}
