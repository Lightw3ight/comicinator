import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { BookGroupStore } from '../core/store/book-group/book-group.store';
import { BooksViewBarComponent } from './books-view-bar/books-view-bar.component';
import { GroupListComponent } from './group-list/group-list.component';
import { MainBookListComponent } from './main-book-list/main-book-list.component';

@Component({
    selector: 'cbx-books',
    templateUrl: 'books.component.html',
    styleUrl: 'books.component.scss',
    imports: [MainBookListComponent, BooksViewBarComponent, GroupListComponent],
})
export class BooksComponent {
    private bookGroupStore = inject(BookGroupStore);
    private route = inject(ActivatedRoute);

    protected readonly search = this.getSearchFromQuerystring();
    protected readonly pageTitle = this.computePageTitle();
    protected readonly groupingActive = this.computeGroupingActive();

    private computePageTitle() {
        return computed(() => {
            if (this.groupingActive()) {
                return this.search()
                    ? `Grouped By: ${this.bookGroupStore.groupField()}; Search Results: ${this.search()}`
                    : `Grouped By: ${this.bookGroupStore.groupField()}`;
            }
            return this.search() ? `Search Results: ${this.search()}` : 'Books';
        });
    }

    private computeGroupingActive() {
        return computed(() => {
            return this.bookGroupStore.groupField() != null;
        });
    }

    private getSearchFromQuerystring() {
        return toSignal(
            this.route.queryParamMap.pipe(
                map((pMap) => pMap.get('search') ?? undefined)
            )
        );
    }
}
