import {
    Component,
    computed,
    inject,
    input,
    numberAttribute,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { BookGroupStore } from '../core/store/book-group/book-group.store';
import { BooksViewBarComponent } from './books-view-bar/books-view-bar.component';
import { GroupListComponent } from './group-list/group-list.component';
import { MainBookListComponent } from './main-book-list/main-book-list.component';
import { LibraryStore } from '../core/store/library/library.store';

@Component({
    selector: 'cbx-books',
    templateUrl: 'books.component.html',
    styleUrl: 'books.component.scss',
    imports: [MainBookListComponent, BooksViewBarComponent, GroupListComponent],
})
export class BooksComponent {
    private bookGroupStore = inject(BookGroupStore);
    private libraryStore = inject(LibraryStore);
    private route = inject(ActivatedRoute);

    public readonly libraryId = input(undefined, {
        transform: numberAttribute,
    });

    protected readonly search = this.getSearchFromQuerystring();
    protected readonly pageTitle = this.computePageTitle();
    protected readonly groupingActive = this.computeGroupingActive();

    private computePageTitle() {
        return computed(() => {
            const libraryId = this.libraryId();
            let title = 'Books';

            if (libraryId) {
                const lib = this.libraryStore.entityMap()[libraryId];
                title = lib?.name;
            }

            if (this.groupingActive()) {
                title = `${title} // Group: ${this.bookGroupStore.groupField()}`;
            }

            if (this.search()) {
                title = `${title} // Search: ${this.search()}`;
            }

            return title;
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
                map((pMap) => pMap.get('search') ?? undefined),
            ),
        );
    }
}
