
import { Component, inject, input, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../../core/models/book.interface';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { VirtualThumbListComponent } from '../../shared/virtual-thumb-list/virtual-thumb-list.component';
import { BookListItemComponent } from './../book-list-item/book-list-item.component';
import { ElectronService } from '../../core/electron.service';

@Component({
    selector: 'cbx-book-list',
    templateUrl: 'book-list.component.html',
    styleUrl: 'book-list.component.scss',
    imports: [
    BookListItemComponent,
    VirtualThumbListComponent,
    ThumbListItemTemplateDirective,
    RouterLink
],
})
export class BookListComponent implements OnDestroy {
    private electron = inject(ElectronService);

    public books = input.required<Book[]>();

    public async ngOnDestroy() {
        await this.electron.abortImageQueue();
    }
}
