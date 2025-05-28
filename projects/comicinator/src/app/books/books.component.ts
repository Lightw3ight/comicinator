import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    effect,
    inject,
    OnDestroy,
    Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { BooksStore } from '../core/store/books/books.store';
import { BookListComponent } from './book-list/book-list.component';
import { BooksViewBarComponent } from './books-view-bar/books-view-bar.component';
import { GroupListComponent } from './group-list/group-list.component';
import { QuickFilterComponent } from '../shared/quick-filter/quick-filter.component';
import { BookGroupStore } from '../core/store/book-group/book-group.store';
import { FilterOperator } from '../core/models/filter-operator.type';
import { ElectronService } from '../core/electron.service';

@Component({
    selector: 'cmx-books',
    templateUrl: 'books.component.html',
    styleUrl: 'books.component.scss',
    imports: [
        CommonModule,
        BookListComponent,
        BooksViewBarComponent,
        GroupListComponent,
        QuickFilterComponent,
    ],
})
export class BooksComponent {
    private booksStore = inject(BooksStore);
    private bookGroupStore = inject(BookGroupStore);
    private route = inject(ActivatedRoute);

    protected readonly books = this.booksStore.displayItems;
    protected readonly quickSearch = this.booksStore.quickSearch;
    protected readonly search = this.getSearchFromQuerystring();
    protected readonly searchTitle = this.computeSearchTitle();

    constructor() {
        effect(async () => {
            const search = this.search();
            window.scrollTo(0, 0);

            if (search?.length) {
                await this.booksStore.search(search);
            } else {
                this.booksStore.clearSearch();
                this.booksStore.runQuickSearch(this.booksStore.quickSearch());
            }
        });
    }

    protected showGroupedBooks = computed(
        () => this.bookGroupStore.groupField() != undefined,
    );

    protected computeSearchTitle() {
        return computed(() => {
            return `Search Results: ${this.search()}`;
        });
    }

    protected async setQuickFilter(filter: string) {
        await this.booksStore.runQuickSearch(filter);
    }

    private getSearchFromQuerystring() {
        return toSignal(
            this.route.queryParamMap.pipe(
                map((pMap) => pMap.get('search') ?? undefined),
            ),
        );
    }
}
