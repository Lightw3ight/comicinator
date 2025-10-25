import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BookViewerService } from '../../../books/book-viewer/book-viewer.service';
import { Book } from '../../models/book.interface';
import { BooksStore } from '../../store/books/books.store';
import { NavListItemComponent } from '../nav-list/nav-list-item/nav-list-item.component';
import { NavListComponent } from '../nav-list/nav-list.component';

@Component({
    selector: 'cbx-last-read-list',
    templateUrl: 'last-read-list.component.html',
    styleUrl: 'last-read-list.component.scss',
    imports: [NavListComponent, NavListItemComponent, MatIcon, MatIconButton],
})
export class LastReadListComponent {
    private bookStore = inject(BooksStore);
    private bookViewer = inject(BookViewerService);
    private router = inject(Router);

    protected books = this.computeLastInProgressBooks();

    protected onItemClick(args: MouseEvent, book: Book) {
        if (args.ctrlKey) {
            this.router.navigate(['/books', book.id]);
        } else {
            this.bookViewer.openBook(book);
        }
    }

    protected refresh() {
        this.bookStore.loadLastRead();
    }

    private createBookListItem(book: Book) {
        const { series, title, number } = book;

        const label =
            number == null
                ? `${series ?? title}`
                : `${series ?? title} # ${number}`;
        const progress = this.calculatePercentageRead(book);
        return {
            data: book,
            label,
            progress,
        };
    }

    private calculatePercentageRead(book: Book) {
        const { pageCount } = book;
        const bookState = this.bookStore.userBookStateMap()[book.id];
        const currentPage = bookState?.currentPage;

        if (pageCount == null || currentPage == null) {
            return 0;
        }

        return Math.round((currentPage / pageCount) * 100);
    }

    private computeLastInProgressBooks() {
        return computed(() => {
            const books = this.bookStore.lastRead();

            return books.map((b) => this.createBookListItem(b));
        });
    }
}
