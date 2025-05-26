import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { BooksStore } from '../core/store/books/books.store';
import { BookListComponent } from './book-list/book-list.component';
import { BooksViewBarComponent } from './books-view-bar/books-view-bar.component';
import { GroupListComponent } from './group-list/group-list.component';

@Component({
    selector: 'cmx-books',
    templateUrl: 'books.component.html',
    styleUrl: 'books.component.scss',
    imports: [
        CommonModule,
        BookListComponent,
        BooksViewBarComponent,
        GroupListComponent,
    ],
})
export class BooksComponent {
    private booksStore = inject(BooksStore);
    private route = inject(ActivatedRoute);

    protected books = this.booksStore.pageView;
    protected searchValue = toSignal(
        this.route.queryParamMap.pipe(map((pMap) => pMap.get('search'))),
    );
    protected searchTitle = this.computeSearchTitle();

    constructor() {
        effect(() => {
            const search = this.searchValue();
            window.scrollTo(0, 0);

            if (search?.length) {
                this.booksStore.search(search);
            } else {
                this.booksStore.clearSearch();
            }
        });
    }

    protected showGroupedBooks = computed(
        () => this.booksStore.activeGroupField() != undefined,
    );

    protected computeSearchTitle() {
        return computed(() => {
            return `Search Results: ${this.searchValue()}`;
        });
    }
}
