import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { BooksStore } from '../../core/store/books/books.store';

@Component({
    selector: 'cbx-books-view-bar',
    templateUrl: 'books-view-bar.component.html',
    styleUrl: 'books-view-bar.component.scss',
    imports: [MatMenuModule],
})
export class BooksViewBarComponent {
    private booksStore = inject(BooksStore);

    protected groupedField = this.booksStore.activeGroupField;

    protected async changeGrouping(field: string | undefined) {
        await this.booksStore.setActiveGroupBy(field);
    }
}
