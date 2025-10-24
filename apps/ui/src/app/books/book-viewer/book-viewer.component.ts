import {
    Component,
    computed,
    ElementRef,
    HostListener,
    inject,
    OnDestroy,
    OnInit,
    signal,
    viewChild,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ElectronService } from '../../core/electron.service';
import { MessagingService } from '../../core/messaging/messaging.service';
import { Book } from '../../core/models/book.interface';
import { BooksStore } from '../../core/store/books/books.store';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ImageFit } from '../book/book.component';

export const FIT_KEY = 'image-viewer-fit';
export const ZOOM_KEY = 'image-viewer-zoom';

@Component({
    selector: 'cbx-book-viewer',
    templateUrl: 'book-viewer.component.html',
    styleUrl: 'book-viewer.component.scss',
    imports: [
        PageHeaderComponent,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatButton,
        MatIconButton,
        MatMenuTrigger,
        MatDialogClose,
        MatProgressSpinner,
    ],
})
export class BookViewerComponent implements OnDestroy, OnInit {
    private bookStore = inject(BooksStore);
    private electronService = inject(ElectronService);
    protected bookArg = inject<Book>(MAT_DIALOG_DATA);
    private messagingService = inject(MessagingService);

    private readonly book = signal(this.bookArg);
    protected readonly currentFit = signal<ImageFit>(this.getInitialFit());
    protected readonly title = this.computeTitle();
    protected readonly loading = signal(false);
    protected readonly images = signal<{ entryName: string; url: string }[]>(
        [],
    );
    protected readonly imageIndex = signal<number>(0);
    protected readonly activeImage = this.computeActiveImage();
    protected readonly zoomLevel = signal(this.getInitialZoom());
    protected readonly zoomLabel = this.computeZoomLabel();
    protected readonly percentageRead = this.computePercentageRead();
    protected readonly nextBook = signal<Book | undefined>(undefined);
    protected readonly showReadNext = this.computeCanReadNext();

    private viewerRef =
        viewChild<ElementRef<HTMLDivElement>>('viewerContainer');
    private viewer = computed(() => this.viewerRef()?.nativeElement);

    public ngOnInit(): void {
        this.loadBook(this.book());
    }

    protected loadNextBook() {
        this.loadBook(this.nextBook()!);
    }

    private loadBook(book: Book) {
        if (this.book() !== book) {
            this.book.set(book);
        }

        this.loadImages();

        if (book.series && book.number) {
            this.bookStore.searchNextInSeries(book).then((nextBook) => {
                this.nextBook.set(nextBook);
            });
        } else {
            this.nextBook.set(undefined);
        }
    }

    public ngOnDestroy(): void {
        this.disposeActiveUrls();
    }

    private computePercentageRead() {
        return computed(() => {
            const pageCount = this.images().length;
            const currentPage = this.imageIndex() + 1;

            if (pageCount === 0) {
                return 0;
            }

            return Math.round((currentPage / pageCount) * 100);
        });
    }

    protected async setAsFrontCover() {
        const confirmed = await this.messagingService.confirm(
            'Set as front cover?',
            'Are you sure you want to set the current page as the front cover?',
        );

        if (confirmed) {
            const book: Book = {
                ...this.book(),
                frontCover: this.activeImage()?.entryName,
            };
            await this.bookStore.updateBook(book);
            await this.electronService.removeThumbCache(book.filePath);
            this.messagingService.message({
                title: 'Front cover changed',
                message: `The front cover has been updated to the current page`,
                hideRejectButton: true,
                confirmButtonText: 'OK',
            });
        }
    }

    @HostListener('window:keydown', ['$event'])
    protected handleKeyDown(args: KeyboardEvent) {
        switch (args.key) {
            case 'ArrowDown':
                this.readNext();
                args.preventDefault();
                break;
            case ' ':
                if (args.shiftKey) {
                    this.readPrevious();
                } else {
                    this.readNext();
                }
                args.preventDefault();
                break;
            case 'ArrowRight':
                this.nextPage();
                args.preventDefault();
                break;
            case 'ArrowUp':
                this.readPrevious();
                args.preventDefault();
                break;
            case 'ArrowLeft':
                this.prevPage();
                args.preventDefault();
                break;
        }
    }

    private readNext() {
        const viewer = this.viewer()!;

        if (
            viewer.offsetHeight === viewer.scrollHeight ||
            Math.ceil(viewer.scrollTop) + viewer.offsetHeight >=
                viewer.scrollHeight
        ) {
            this.nextPage();
        } else {
            viewer.scrollTo({
                top: viewer.scrollHeight - viewer.offsetHeight,
                behavior: 'smooth',
            });
        }
    }

    private readPrevious() {
        const viewer = this.viewer()!;

        if (
            viewer.offsetHeight === viewer.scrollHeight ||
            viewer.scrollTop === 0
        ) {
            this.prevPage(true);
        } else {
            viewer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    protected setZoom(val: number) {
        this.zoomLevel.set(val);
        localStorage.setItem(ZOOM_KEY, val.toString());
    }

    protected changeFit(fit: ImageFit) {
        this.currentFit.set(fit);
        localStorage.setItem(FIT_KEY, fit);
    }

    protected loadImages() {
        this.loading.set(true);
        this.disposeActiveUrls();

        this.electronService
            .zipReadImages(this.book().filePath)
            .then((imageData) => {
                const urls = imageData
                    .sort((a, b) => a.entryName.localeCompare(b.entryName))
                    .map((item) => {
                        const image = new Blob([new Uint8Array(item.image)], {
                            type: 'image/jpeg',
                        });
                        return {
                            entryName: item.entryName,
                            url: URL.createObjectURL(image),
                        };
                    });

                let currentPage = (this.book().currentPage ?? 1) - 1;

                if (currentPage > urls.length || currentPage < 0) {
                    currentPage = 0;
                }

                this.images.set(urls);
                this.imageIndex.set(currentPage);
                this.loading.set(false);

                this.bookStore.setReadDetails(
                    this.book().id,
                    currentPage + 1,
                    urls.length,
                );
            });
    }

    protected nextPage() {
        if (this.imageIndex() < this.images().length - 1) {
            this.viewer()!.scrollTo({ behavior: 'smooth', top: 0 });
            this.setPage(this.imageIndex() + 1);
        }
    }

    protected prevPage(scrollBottom = false) {
        if (this.imageIndex() > 0) {
            this.setPage(this.imageIndex() - 1);
            if (scrollBottom) {
                this.viewer()!.scrollTo({
                    behavior: 'smooth',
                    top: this.viewer()?.scrollHeight,
                });
            } else {
                this.viewer()!.scrollTo({ behavior: 'smooth', top: 0 });
            }
        }
    }

    protected setPage(num: number) {
        this.imageIndex.set(Math.max(num, 0));
        this.bookStore.setReadDetails(
            this.book().id,
            num + 1,
            this.images().length,
        );
    }

    private disposeActiveUrls() {
        const oldItems = this.images();

        this.images.set([]);
        oldItems.forEach((item) => {
            URL.revokeObjectURL(item.url);
        });
    }

    private getInitialFit(): ImageFit {
        return (localStorage.getItem(FIT_KEY) as ImageFit) ?? 'height';
    }

    private getInitialZoom(): number {
        const val = localStorage.getItem(ZOOM_KEY);
        if (val && !isNaN(+val)) {
            return +val;
        }

        return 1;
    }

    private computeTitle() {
        return computed(() => {
            const book = this.book();

            if (book.series) {
                let title = book.series;

                if (book.number) {
                    title = title + ` #${book.number}`;
                }

                if (book.volume) {
                    title = title + ` V${book.volume}`;
                }

                return title;
            }

            return book.title;
        });
    }

    private computeActiveImage() {
        return computed(() => {
            const images = this.images();
            const index = this.imageIndex();

            if (images.length === 0) {
                return undefined;
            }

            if (index > images.length - 1) {
                return images[0];
            }

            return images[index];
        });
    }

    private computeZoomLabel() {
        return computed(() => {
            const val = this.zoomLevel() * 100;
            return `${val}%`;
        });
    }

    private computeCanReadNext() {
        return computed(() => {
            if (this.loading()) {
                return false;
            }

            if (this.nextBook() == null || this.images().length === 0) {
                return false;
            }

            return this.imageIndex() === this.images().length - 1;
        });
    }
}
