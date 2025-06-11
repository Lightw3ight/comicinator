import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Book } from '../core/models/book.interface';
import { BooksStore } from '../core/store/books/books.store';
import { CountedDataSource } from '../shared/counted-data-source';

export class BookDataSource extends CountedDataSource<Book[]> {
    private cachedData: Book[][];
    private fetchedPages = new Set<number>();
    private readonly dataStream: BehaviorSubject<Book[][]>;

    private readonly rowCount: number;

    constructor(
        public readonly itemCount: number,
        public readonly columnCount: number,
        private booksStore: InstanceType<typeof BooksStore>,
    ) {
        super();
        this.rowCount = Math.max(itemCount / columnCount);
        this.cachedData = Array.from<Book[]>({ length: this.rowCount });
        this.dataStream = new BehaviorSubject<Book[][]>(this.cachedData);
    }

    private readonly _subscription = new Subscription();

    connect(collectionViewer: CollectionViewer): Observable<readonly Book[][]> {
        this._subscription.add(
            collectionViewer.viewChange.subscribe((range) => {
                const startPage = this.getPageForIndex(range.start);
                const endPage = this.getPageForIndex(range.end - 1);

                for (let i = startPage; i <= endPage; i++) {
                    this.fetchPage(i);
                }
            }),
        );

        return this.dataStream;
    }

    disconnect(_collectionViewer: CollectionViewer): void {
        this._subscription.unsubscribe();
    }

    private getPageForIndex(index: number): number {
        return Math.floor(index / this.rowCount);
    }

    private chunkItems(items: Book[]) {
        return items.reduce<Book[][]>((acc, item, index) => {
            const chunkIndex = Math.floor(index / this.columnCount);
            acc[chunkIndex] = acc[chunkIndex] ?? [];
            acc[chunkIndex].push(item);
            return acc;
        }, []);
    }

    private fetchPage(page: number) {
        if (this.fetchedPages.has(page)) {
            return;
        }
        this.fetchedPages.add(page);

        const pageSize = 20;
        const pageItemSize = this.columnCount * pageSize;

        this.booksStore.loadPage(page, pageItemSize).then((books) => {
            this.cachedData.splice(
                page * pageSize,
                pageSize,
                ...this.chunkItems(books),
            );
            this.dataStream.next(this.cachedData);
        });
    }
}
