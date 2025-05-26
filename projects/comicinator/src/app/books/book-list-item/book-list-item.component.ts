import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from '../../core/models/book.interface';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { bookThumbCssSrc } from '../../shared/book-thumb-path';

@Component({
    selector: 'cmx-book-list-item',
    templateUrl: 'book-list-item.component.html',
    styleUrl: 'book-list-item.component.scss',
    imports: [IconButtonComponent],
})
export class BookListItemComponent {
    private dialog = inject(MatDialog);

    public readonly book = input.required<Book>();

    protected thumbSrc = this.computeThumbSrc();

    private computeThumbSrc() {
        return computed(() => {
            return bookThumbCssSrc(this.book().filePath);
        });
    }

    public onEditClick(args: MouseEvent) {
        args.stopPropagation();

        this.dialog.open(BookFormComponent, {
            data: this.book(),
            minWidth: 800,
        });
    }
}
