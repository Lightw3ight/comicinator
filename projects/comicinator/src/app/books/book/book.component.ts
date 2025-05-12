import {
    Component,
    computed,
    effect,
    inject,
    input,
    numberAttribute,
    OnDestroy,
    signal,
    Signal,
    untracked,
} from '@angular/core';
import { ElectronService } from '../../core/electron.service';
import { Book } from '../../core/models/book.interface';
import { BooksStore } from '../../core/store/books/books.store';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'cbx-book',
    templateUrl: 'book.component.html',
    styleUrl: 'book.component.scss',
    imports: [MatProgressBarModule]
})
export class BookComponent implements OnDestroy {
    private booksStore = inject(BooksStore);
    private electronService = inject(ElectronService);

    public readonly id = input.required({ transform: numberAttribute });

    protected readonly book = this.computeBook();
    protected readonly imageUrls = signal<string[]>([]);
    protected readonly imageIndex = signal<number>(0);
    protected readonly activeImageUrl = this.computeActiveImageUrl();
    protected readonly loading = signal(true);

    constructor() {
        effect(() => {
            const book = this.book();

            if (book) {
                untracked(() => {
                    this.loadImages(book);
                });
            }
        });
    }

    public ngOnDestroy(): void {
        this.disposeActiveUrls();
    }

    protected onPageClick(args: MouseEvent) {
        if (args.shiftKey) {
            this.prevPage();
        } else {
            this.nextPage();
        }
    }

    protected nextPage() {
        if (this.imageIndex() < this.imageUrls().length - 1) {
            window.scrollTo({ behavior: 'smooth', top: 0 });
            this.imageIndex.update((val) => val + 1);
        }
    }

    protected prevPage() {
        if (this.imageIndex() > 0) {
            this.imageIndex.update((val) => val - 1);
            setTimeout(() => {
                window.scrollTo({ behavior: 'smooth', top: document.body.scrollHeight });
            })
        }
    }

    private computeBook(): Signal<Book> {
        return computed(() => {
            const id = this.id();
            return this.booksStore.entityMap()[id];
        });
    }

    private computeActiveImageUrl() {
        return computed(() => {
            const urls = this.imageUrls();
            const index = this.imageIndex();

            if (urls.length === 0) {
                return undefined;
            }

            if (index > urls.length - 1) {
                return urls[0];
            }

            return urls[index];
        });
    }

    private disposeActiveUrls() {
        const oldUrls = this.imageUrls();

        this.imageUrls.set([]);
        oldUrls.forEach((url) => {
            URL.revokeObjectURL(url);
        });
    }

    private loadImages(book: Book) {
        this.loading.set(true);
        this.disposeActiveUrls();

        this.electronService.zipReadImages(book.filePath).then((imageData) => {
            const urls = imageData.map((item) => {
                const image = new Blob([item], { type: 'image/jpeg' });
                return URL.createObjectURL(image);
            });

            this.imageUrls.set(urls);
            this.imageIndex.set(0);
            this.loading.set(false);
        });
    }
}
