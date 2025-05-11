import { Component, computed, input, OnInit } from '@angular/core';
import { Book } from '../../core/models/book.interface';

@Component({
    selector: 'cmx-book-item',
    templateUrl: 'book-item.component.html',
    styleUrl: 'book-item.component.scss'
})

export class BookItemComponent {
    public readonly book = input.required<Book>();

    protected thumbSrc = this.computeThumbSrc();

    private computeThumbSrc() {
        return computed(() => {
            // book().filePath
            return `url('zip-thumb://${encodeURIComponent(this.book().filePath)}')`;
        });
    }
}