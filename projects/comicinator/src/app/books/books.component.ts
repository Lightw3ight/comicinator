import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BooksStore } from '../core/store/books/books.store';
import { BookListComponent } from './book-list/book-list.component';

@Component({
    selector: 'cmx-books',
    templateUrl: 'books.component.html',
    styleUrl: 'books.component.scss',
    imports: [CommonModule, BookListComponent],
})
export class BooksComponent {
    private booksStore = inject(BooksStore);

    protected books = this.booksStore.entities;
}
