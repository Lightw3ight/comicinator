import {
    Component,
    computed,
    effect,
    inject,
    input,
    untracked,
} from '@angular/core';
import { Book } from '../../core/models/book.interface';
import { BookGroupStore } from '../../core/store/book-group/book-group.store';
import { BooksStore } from '../../core/store/books/books.store';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { BookListComponent } from '../book-list/book-list.component';

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
                await this.bookGroupStore.setActiveGroup(field, value);
            });
        });
    }

    private computeBooks() {
        return computed(() => {
            const ids = this.bookGroupStore.activeGroupBooks() ?? [];
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
