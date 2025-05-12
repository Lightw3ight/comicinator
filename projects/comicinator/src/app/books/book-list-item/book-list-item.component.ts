import { Component, computed, input, OnInit } from '@angular/core';
import { Book } from '../../core/models/book.interface';

@Component({
    selector: 'cmx-book-list-item',
    templateUrl: 'book-list-item.component.html',
    styleUrl: 'book-list-item.component.scss'
})

export class BookListItemComponent {
    public readonly book = input.required<Book>();

    protected thumbSrc = this.computeThumbSrc();

    private computeThumbSrc() {
        return computed(() => {
            return `url('zip-thumb://${encodeURIComponent(this.book().filePath)}')`;
        });
    }
}