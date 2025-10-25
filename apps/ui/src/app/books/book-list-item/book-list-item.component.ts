import { Component, computed, inject, input, Signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Book } from '../../core/models/book.interface';
import { BooksStore } from '../../core/store/books/books.store';
import { bookThumbCssSrc } from '../../shared/book-thumb-path';
import { BookFormComponent } from '../book-form/book-form.component';
import { BookViewerService } from '../book-viewer/book-viewer.service';
import { ThumbActionsComponent } from '../../shared/thumb-actions/thumb-actions.component';
import { UserBookState } from '../../core/models/user-book-state.interface';

@Component({
    selector: 'cbx-book-list-item',
    templateUrl: 'book-list-item.component.html',
    styleUrl: 'book-list-item.component.scss',
    imports: [MatIcon, MatIconButton, ThumbActionsComponent],
})
export class BookListItemComponent {
    private dialog = inject(MatDialog);
    private booksStore = inject(BooksStore);
    private bookViewer = inject(BookViewerService);

    public readonly book = input<Book>();
    public readonly bookId = input<number>();

    protected thumbSrc = this.computeThumbSrc();
    protected bookData = this.computeBookData();
    protected bookState = this.computeBookState();

    private computeThumbSrc() {
        return computed(() => {
            return bookThumbCssSrc(this.bookData().filePath);
        });
    }

    protected onViewClick(args: MouseEvent) {
        args.stopPropagation();
        this.bookViewer.openBook(this.bookData()!);
    }

    protected onEditClick(args: MouseEvent) {
        args.stopPropagation();

        this.dialog.open(BookFormComponent, {
            data: this.bookData(),
            minWidth: 800,
        });
    }

    protected onToggleCompleteClick(args: MouseEvent) {
        args.stopPropagation();

        const complete = !this.bookState()?.complete;
        this.booksStore.markComplete(this.bookData(), complete);
    }

    private computeBookData() {
        return computed(() => {
            return this.book() ?? this.booksStore.entityMap()[this.bookId()!];
        });
    }

    private computeBookState(): Signal<UserBookState | undefined> {
        return computed(() => {
            return this.booksStore.userBookStateMap()[this.bookData().id];
        });
    }
}
