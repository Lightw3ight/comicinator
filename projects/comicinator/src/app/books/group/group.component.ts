import {
    Component,
    computed,
    effect,
    inject,
    input,
    untracked,
} from '@angular/core';
import { BooksStore } from '../../core/store/books/books.store';
import { BookListComponent } from '../book-list/book-list.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
    selector: 'cbx-group',
    templateUrl: 'group.component.html',
    styleUrl: 'group.component.scss',
    imports: [BookListComponent, PageHeaderComponent],
})
export class GroupComponent {
    private booksStore = inject(BooksStore);
    public groupField = input.required<string>();
    public groupValue = input.required<string>();

    protected books = this.booksStore.groupedBooks;
    protected title = this.computeTitle();

    constructor() {
        effect(() => {
            const field = this.groupField();
            const value = this.groupValue();

            untracked(() => {
                this.booksStore.loadGroupedBooks(field, value);
            });
        });
    }

    private computeTitle() {
        return computed(() => {
            return `${this.capitalizeFirstLetter(
                this.groupField()
            )}: ${this.groupValue()}`;
        });
    }

    private capitalizeFirstLetter(val: string) {
        return val.charAt(0).toUpperCase() + val.slice(1);
    }
}
