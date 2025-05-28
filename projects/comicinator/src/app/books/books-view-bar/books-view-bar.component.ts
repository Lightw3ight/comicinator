import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { BooksStore } from '../../core/store/books/books.store';
import { BookGroupStore } from '../../core/store/book-group/book-group.store';
import { Book } from '../../core/models/book.interface';

@Component({
    selector: 'cbx-books-view-bar',
    templateUrl: 'books-view-bar.component.html',
    styleUrl: 'books-view-bar.component.scss',
    imports: [MatMenuModule],
})
export class BooksViewBarComponent {
    private bookGroupStore = inject(BookGroupStore);

    protected groupedField = this.bookGroupStore.groupField;

    protected async changeGrouping(field: keyof Book | undefined) {
        if (field == null) {
            this.bookGroupStore.clearGrouping();
        } else {
            this.bookGroupStore.setActiveGroupBy(field);
        }
    }
}
