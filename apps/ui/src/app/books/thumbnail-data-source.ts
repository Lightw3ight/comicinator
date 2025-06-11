import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';
import { PAGE_SCROLL_SIZE } from '../core/models/page-scroll-size.const';

export class ThumbnailDataSource<T> extends DataSource<T[]> {
    private readonly subscription = new Subscription();
    private lastPageRange: { startPage: number; endPage: number } | undefined;

    constructor(
        private dataStream: Observable<T[][]>,
        private fetchPage: (pageIndex: number) => void
    ) {
        super();
    }

    connect(collectionViewer: CollectionViewer): Observable<readonly T[][]> {
        this.subscription.add(
            collectionViewer.viewChange.subscribe((range) => {
                const startPage = this.getPageForIndex(range.start);
                const endPage = this.getPageForIndex(range.end - 1);

                this.lastPageRange = { startPage, endPage };

                for (let i = startPage; i <= endPage; i++) {
                    this.fetchPage(i);
                }
            })
        );

        return this.dataStream;
    }

    disconnect(_collectionViewer: CollectionViewer): void {
        this.subscription.unsubscribe();
    }

    public refetchLast() {
        if (this.lastPageRange) {
            for (
                let i = this.lastPageRange.startPage;
                i <= this.lastPageRange.endPage;
                i++
            ) {
                this.fetchPage(i);
            }
        }
    }

    private getPageForIndex(index: number): number {
        return Math.floor(index / PAGE_SCROLL_SIZE);
    }
}
