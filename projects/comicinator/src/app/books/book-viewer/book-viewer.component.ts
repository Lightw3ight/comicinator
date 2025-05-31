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
import { MatProgressBar } from '@angular/material/progress-bar';
import { ElectronService } from '../../core/electron.service';
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
        MatProgressBar,
    ],
})
export class BookViewerComponent implements OnDestroy, OnInit {
    private bookStore = inject(BooksStore);
    private electronService = inject(ElectronService);
    protected book = inject<Book>(MAT_DIALOG_DATA);

    protected currentFit = signal<ImageFit>(this.getInitialFit());
    protected title = this.getTitle();
    protected readonly loading = signal(false);
    protected readonly imageUrls = signal<string[]>([]);
    protected readonly imageIndex = signal<number>(0);
    protected readonly activeImageUrl = this.computeActiveImageUrl();
    protected zoomLevel = signal(this.getInitialZoom());
    protected readonly zoomLabel = this.computeZoomLabel();

    private viewerRef =
        viewChild<ElementRef<HTMLDivElement>>('viewerContainer');
    private viewer = computed(() => this.viewerRef()?.nativeElement);

    public ngOnInit(): void {
        this.loadImages();
    }

    public ngOnDestroy(): void {
        this.disposeActiveUrls();
    }

    @HostListener('window:keydown', ['$event'])
    protected handleKeyDown(args: KeyboardEvent) {
        // console.log('key', args.key);
        switch (args.key) {
            case 'ArrowDown':
                this.readNext();
                args.preventDefault();
                break;
            case ' ':
                args.shiftKey ? this.readPrevious() : this.readNext();
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
            viewer.scrollTop + viewer.offsetHeight === viewer.scrollHeight
        ) {
            console.log('next page from read next');
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
            .zipReadImages(this.book.filePath)
            .then((imageData) => {
                const urls = imageData.map((item) => {
                    const image = new Blob([item], { type: 'image/jpeg' });
                    return URL.createObjectURL(image);
                });

                let currentPage = this.book.currentPage ?? 0;

                if (currentPage > urls.length) {
                    currentPage = 0;
                }

                this.imageUrls.set(urls);
                this.imageIndex.set(currentPage);
                this.loading.set(false);

                this.bookStore.setReadDetails(
                    this.book.id,
                    currentPage,
                    urls.length,
                );
            });
    }

    protected nextPage() {
        if (this.imageIndex() < this.imageUrls().length - 1) {
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

    private setPage(num: number) {
        this.imageIndex.set(num);
        this.bookStore.setReadDetails(
            this.book.id,
            num,
            this.imageUrls().length,
        );
    }

    private disposeActiveUrls() {
        const oldUrls = this.imageUrls();

        this.imageUrls.set([]);
        oldUrls.forEach((url) => {
            URL.revokeObjectURL(url);
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

    private getTitle() {
        if (this.book.series) {
            return `${this.book.series}: ${this.book.title}`;
        }

        return this.book.title;
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

    private computeZoomLabel() {
        return computed(() => {
            const val = this.zoomLevel() * 100;
            return `${val}%`;
        });
    }
}
