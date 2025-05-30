import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from '../../core/models/book.interface';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { bookThumbCssSrc } from '../../shared/book-thumb-path';
import { BooksStore } from '../../core/store/books/books.store';

@Component({
    selector: 'cmx-book-list-item',
    templateUrl: 'book-list-item.component.html',
    styleUrl: 'book-list-item.component.scss',
    imports: [IconButtonComponent],
})
export class BookListItemComponent {
    private dialog = inject(MatDialog);
    private booksStore = inject(BooksStore);

    public readonly book = input<Book>();
    public readonly bookId = input<number>();

    protected thumbSrc = this.computeThumbSrc();
    protected bookData = this.computeBookData();

    private computeThumbSrc() {
        return computed(() => {
            return bookThumbCssSrc(this.bookData().filePath);
        });
    }

    protected onEditClick(args: MouseEvent) {
        args.stopPropagation();

        this.dialog.open(BookFormComponent, {
            data: this.bookData(),
            minWidth: 800,
        });
    }

    private computeBookData() {
        return computed(() => {
            return this.book() ?? this.booksStore.entityMap()[this.bookId()!];
        });
    }
}
