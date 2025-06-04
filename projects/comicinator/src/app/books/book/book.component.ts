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
import { MessagingService } from '../../core/messaging/messaging.service';
import { Book } from '../../core/models/book.interface';
import { BooksStore } from '../../core/store/books/books.store';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { bookThumbCssSrc, bookThumbSrc } from '../../shared/book-thumb-path';
import { CharacterListComponent } from '../../characters/character-list/character-list.component';
import { BookDetailsStore } from './store/book-details.store';
import { ContentSuperComponent } from '../../shared/content-super/content-super.component';
import { BookViewerComponent } from '../book-viewer/book-viewer.component';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TeamListComponent } from '../../teams/team-list/team-list.component';
import { LocationListComponent } from '../../locations/location-list/location-list.component';
import { BookViewerService } from '../book-viewer/book-viewer.service';

export type ImageFit = 'width' | 'height' | 'all';

export const FIT_KEY = 'image-viewer-fit';

@Component({
    selector: 'cbx-book',
    templateUrl: 'book.component.html',
    styleUrl: 'book.component.scss',
    providers: [BookDetailsStore],
    imports: [
        MatProgressBarModule,
        MatIconButton,
        MatIcon,
        MatButtonModule,
        CharacterListComponent,
        TeamListComponent,
        LocationListComponent,
        ContentSuperComponent,
        MatTab,
        MatTabGroup,
    ],
})
export class BookComponent {
    private booksStore = inject(BooksStore);
    private electronService = inject(ElectronService);
    private fileSystem = inject(FileSystemService);
    private dialog = inject(MatDialog);
    private router = inject(Router);
    private messagingService = inject(MessagingService);
    private bookDetailsStore = inject(BookDetailsStore);
    private bookViewer = inject(BookViewerService);

    public readonly id = input.required({ transform: numberAttribute });

    protected readonly book = this.bookDetailsStore.book;
    protected readonly characters = this.bookDetailsStore.characters;
    protected readonly teams = this.bookDetailsStore.teams;
    protected readonly locations = this.bookDetailsStore.locations;
    protected readonly loading = signal(false);
    protected readonly title = this.computeTitle();
    protected readonly previewImageSrc = this.computeThumbSrc();
    protected activeTabIndex = signal(0);

    constructor() {
        effect(() => {
            const id = this.id();

            untracked(() => {
                this.bookDetailsStore.setActiveBook(id);
            });
        });
    }

    protected async openBook() {
        await this.bookViewer.openBook(this.book()!);
        this.bookDetailsStore.updateItem();
    }

    protected async clearThumbCache() {
        await this.electronService.removeThumbCache(this.book()!.filePath);
        await this.messagingService.message({
            title: 'Thumbnail removed',
            message: 'Successfully removed thumbnail cache',
            hideRejectButton: true,
            confirmButtonText: 'OK',
        });
    }

    private computeThumbSrc() {
        return computed(() => {
            return this.book()
                ? bookThumbSrc(this.book()!.filePath)
                : undefined;
        });
    }

    protected async removeBook() {
        const ref = this.dialog.open<
            ConfirmDeleteDialogComponent,
            string,
            boolean | [boolean, boolean]
        >(ConfirmDeleteDialogComponent, { data: this.book()!.title });
        const result = await firstValueFrom(ref.afterClosed());

        if (Array.isArray(result)) {
            await this.booksStore.deleteBook(this.book()!.id, result[1]);
            this.router.navigate(['/books'], { replaceUrl: true });
        }
    }

    protected showInExplorer() {
        this.fileSystem.showItemInFolder(this.book()!.filePath);
    }

    protected async edit() {
        const ref = this.dialog.open(BookFormComponent, {
            data: this.book(),
            minWidth: 800,
        });

        await firstValueFrom(ref.afterClosed());
        this.bookDetailsStore.updateItem(true);
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
}
