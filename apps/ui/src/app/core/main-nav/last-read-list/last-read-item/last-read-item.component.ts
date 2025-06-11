import { Component, computed, HostBinding, inject, input } from '@angular/core';
import { BookViewerService } from '../../../../books/book-viewer/book-viewer.service';
import { Book } from '../../../models/book.interface';

@Component({
    selector: 'cbx-last-read-item',
    templateUrl: 'last-read-item.component.html',
    styleUrl: 'last-read-item.component.scss',
})
export class LastReadItemComponent {
    private bookViewer = inject(BookViewerService);

    public readonly book = input.required<Book>();

    protected percentageRead = this.computePercentageRead();
    protected label = this.computeLabel();

    private computeLabel() {
        return computed(() => {
            const { series, title, number } = this.book();

            return number == null
                ? `${series ?? title}`
                : `${series ?? title} # ${number}`;
        });
    }

    private computePercentageRead() {
        return computed(() => {
            const { pageCount, currentPage } = this.book();

            if (pageCount == null || currentPage == null) {
                return 0;
            }

            return Math.round((currentPage / pageCount) * 100);
        });
    }

    protected openBook() {
        this.bookViewer.openBook(this.book());
    }
}
