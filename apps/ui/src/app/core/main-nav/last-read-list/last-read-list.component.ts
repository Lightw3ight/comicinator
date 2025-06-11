import { Component, inject, OnInit } from '@angular/core';
import { BooksStore } from '../../store/books/books.store';
import { BookViewerService } from '../../../books/book-viewer/book-viewer.service';
import { Book } from '../../models/book.interface';
import { LastReadItemComponent } from './last-read-item/last-read-item.component';

@Component({
    selector: 'cbx-last-read-list',
    templateUrl: 'last-read-list.component.html',
    styleUrl: 'last-read-list.component.scss',
    imports: [LastReadItemComponent],
})
export class LastReadListComponent implements OnInit {
    private bookStore = inject(BooksStore);
    private bookViewer = inject(BookViewerService);

    protected books = this.bookStore.lastRead;

    public ngOnInit() {
        this.bookStore.loadLastRead();
    }

    protected openBook(book: Book) {
        this.bookViewer.openBook(book);
    }
}
