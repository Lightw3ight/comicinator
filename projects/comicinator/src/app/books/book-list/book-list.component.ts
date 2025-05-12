import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../../core/models/book.interface';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { VirtualThumbListComponent } from '../../shared/virtual-thumb-list/virtual-thumb-list.component';
import { BookListItemComponent } from './../book-list-item/book-list-item.component';

@Component({
    selector: 'cbx-book-list',
    templateUrl: 'book-list.component.html',
    styleUrl: 'book-list.component.scss',
    imports: [
        CommonModule,
        BookListItemComponent,
        VirtualThumbListComponent,
        ThumbListItemTemplateDirective,
        RouterLink,
    ],
})
export class BookListComponent {
    public books = input.required<Book[]>();
}
