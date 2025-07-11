import { Component, computed, inject, input, Signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from '../../core/models/book.interface';
import { BookGroupStore } from '../../core/store/book-group/book-group.store';
import { BooksStore } from '../../core/store/books/books.store';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SortConfig } from '../../shared/sort-selector/sort-config.interface';
import { SortItemComponent } from '../../shared/sort-selector/sort-item/sort-item.component';
import { SortSelectorComponent } from '../../shared/sort-selector/sort-selector.component';

@Component({
    selector: 'cbx-books-view-bar',
    templateUrl: 'books-view-bar.component.html',
    styleUrl: 'books-view-bar.component.scss',
    imports: [
        MatMenuModule,
        MatIcon,
        MatIconButton,
        MatButton,
        PageHeaderComponent,
        SortSelectorComponent,
        SortItemComponent,
    ],
})
export class BooksViewBarComponent {
    private bookGroupStore = inject(BookGroupStore);
    private booksStore = inject(BooksStore);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    public readonly title = input<string>();

    protected groupedField = this.bookGroupStore.groupField;
    protected sortConfig = this.computeSortConfig();
    protected readonly showClearSearch = this.computeShowClearSearch();

    protected async changeGrouping(field: keyof Book | undefined) {
        if (field == null) {
            this.bookGroupStore.clearActiveGroupField();
        } else {
            this.bookGroupStore.setActiveGroupField(field);
        }
    }

    protected setSorting(sorting: SortConfig) {
        this.booksStore.setSorting(sorting.field as keyof Book, sorting.dir);
    }

    protected clearSearch() {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { search: undefined },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }

    private computeShowClearSearch() {
        return computed(() => {
            if (this.bookGroupStore.groupField() != null) {
                return this.bookGroupStore.searchText() != null;
            }

            return this.booksStore.searchText() != null;
        });
    }

    private computeSortConfig(): Signal<SortConfig> {
        return computed(() => {
            return {
                field: this.booksStore.sortField(),
                dir: this.booksStore.sortDirection(),
            };
        });
    }
}
