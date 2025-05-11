import { Component, inject, OnInit } from '@angular/core';
import { BooksStore } from '../core/store/books/books.store';
import { BookItemComponent } from './book-item/book-item.component';

@Component({
    selector: 'cmx-book-list',
    templateUrl: 'book-list.component.html',
    styleUrl: 'book-list.component.scss',
    imports: [BookItemComponent]
})

export class BookListComponent {
    private booksStore = inject(BooksStore);

    protected books = this.booksStore.entities;
}