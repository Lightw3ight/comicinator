import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from '../../core/models/book.interface';
import { BookViewerComponent } from './book-viewer.component';
import { firstValueFrom } from 'rxjs';
import { BooksStore } from '../../core/store/books/books.store';

@Injectable({ providedIn: 'root' })
export class BookViewerService {
    private dialog = inject(MatDialog);
    private bookStore = inject(BooksStore);

    public async openBook(bookOrId: Book | number) {
        const book: Book =
            typeof bookOrId === 'number'
                ? this.bookStore.entityMap()[bookOrId]
                : bookOrId;

        const ref = this.dialog.open(BookViewerComponent, {
            data: book,
            minWidth: 'calc(100vw - 32px)',
            minHeight: 'calc(100vh - 32px)',
        });
        await firstValueFrom(ref.afterClosed());
    }
}
