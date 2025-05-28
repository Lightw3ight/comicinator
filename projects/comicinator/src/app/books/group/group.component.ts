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
import { BookGroupStore } from '../../core/store/book-group/book-group.store';
import { Book } from '../../core/models/book.interface';

@Component({
    selector: 'cbx-group',
    templateUrl: 'group.component.html',
    styleUrl: 'group.component.scss',
    imports: [BookListComponent, PageHeaderComponent],
})
export class GroupComponent {
    private booksStore = inject(BooksStore);
    private bookGroupStore = inject(BookGroupStore);

    public readonly groupField = input.required<keyof Book>();
    public readonly groupValue = input.required<string>();

    protected readonly books = this.computeBooks();
    protected readonly title = this.computeTitle();

    constructor() {
        effect(() => {
            const field = this.groupField();
            const value = this.groupValue();

            untracked(async () => {
                this.bookGroupStore.setActiveGroupBy(field);
                await this.bookGroupStore.loadGroupBooks(value);
            });
        });
    }

    private computeBooks() {
        return computed(() => {
            const ids =
                this.bookGroupStore.selectGroupBooks(this.groupValue())() ?? [];
            const em = this.booksStore.entityMap();
            return ids.map((id) => em[id]);
        });
    }

    private computeTitle() {
        return computed(() => {
            return `${this.capitalizeFirstLetter(
                this.groupField(),
            )}: ${this.groupValue()}`;
        });
    }

    private capitalizeFirstLetter(val: string) {
        return val.charAt(0).toUpperCase() + val.slice(1);
    }
}
