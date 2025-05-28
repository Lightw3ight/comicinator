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
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ElectronService } from '../../core/electron.service';
import { FileSystemService } from '../../core/file-system.service';
import { Book } from '../../core/models/book.interface';
import { BooksStore } from '../../core/store/books/books.store';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { MessagingService } from '../../core/messaging/messaging.service';

export type ImageFit = 'width' | 'height' | 'all';

export const FIT_KEY = 'image-viewer-fit';

@Component({
    selector: 'cbx-book',
    templateUrl: 'book.component.html',
    styleUrl: 'book.component.scss',
    imports: [
        MatProgressBarModule,
        PageHeaderComponent,
        MatIconButton,
        MatIcon,
        MatMenu,
        MatMenuTrigger,
        MatMenuItem,
        MatButtonModule,
    ],
})
export class BookComponent implements OnDestroy {
    private booksStore = inject(BooksStore);
    private electronService = inject(ElectronService);
    private fileSystem = inject(FileSystemService);
    private dialog = inject(MatDialog);
    private router = inject(Router);
    private messagingService = inject(MessagingService);

    public readonly id = input.required({ transform: numberAttribute });

    protected readonly book = this.computeBook();
    protected readonly imageUrls = signal<string[]>([]);
    protected readonly imageIndex = signal<number>(0);
    protected readonly activeImageUrl = this.computeActiveImageUrl();
    protected readonly loading = signal(true);
    protected readonly title = this.computeTitle();
    protected currentFit = signal<ImageFit>(this.getInitialFit());
    private disableLoad = false;

    constructor() {
        effect(() => {
            const book = this.book();

            if (book && !this.disableLoad) {
                untracked(() => {
                    this.loadImages(book);
                });
            }
        });
    }

    public ngOnDestroy(): void {
        this.disposeActiveUrls();
    }

    protected async clearThumbCache() {
        await this.electronService.removeThumbCache(this.book().filePath);
        await this.messagingService.message({
            title: 'Thumbnail removed',
            message: 'Successfully removed thumbnail cache',
            hideRejectButton: true,
            confirmButtonText: 'OK',
        });
    }

    protected changeFit(fit: ImageFit) {
        this.currentFit.set(fit);
        localStorage.setItem(FIT_KEY, fit);
    }

    protected async removeBook() {
        const ref = this.dialog.open<
            ConfirmDeleteDialogComponent,
            string,
            boolean | [boolean, boolean]
        >(ConfirmDeleteDialogComponent, { data: this.book().title });
        const result = await firstValueFrom(ref.afterClosed());

        if (Array.isArray(result)) {
            await this.booksStore.deleteBook(this.book().id, result[1]);
            this.router.navigate(['/books'], { replaceUrl: true });
        }
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
                window.scrollTo({
                    behavior: 'smooth',
                    top: document.body.scrollHeight,
                });
            });
        }
    }

    protected showInExplorer() {
        this.fileSystem.showItemInFolder(this.book().filePath);
    }

    protected edit() {
        this.dialog.open(BookFormComponent, {
            data: this.book(),
            minWidth: 800,
        });
    }

    private computeBook(): Signal<Book> {
        return computed(() => {
            const id = this.id();
            return this.booksStore.entityMap()[id];
        });
    }

    private computeTitle() {
        return computed(() => {
            const book = this.book();
            if (book == null) {
                return 'Loading...';
            }

            if (book.series) {
                return `${book.series}: ${book.title}`;
            }

            return book.title;
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

    private getInitialFit(): ImageFit {
        return (localStorage.getItem(FIT_KEY) as ImageFit) ?? 'height';
    }
}
