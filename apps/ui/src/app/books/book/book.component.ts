import {
    Component,
    computed,
    effect,
    inject,
    input,
    numberAttribute,
    Signal,
    signal,
    untracked,
} from '@angular/core';
import {
    MatButtonModule,
    MatIconButton,
    MatMiniFabButton,
} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CharacterListComponent } from '../../characters/character-list/character-list.component';
import { ElectronService } from '../../core/electron.service';
import { FileSystemService } from '../../core/file-system.service';
import { MessagingService } from '../../core/messaging/messaging.service';
import { BooksStore } from '../../core/store/books/books.store';
import { LocationListComponent } from '../../locations/location-list/location-list.component';
import { bookThumbSrc } from '../../shared/book-thumb-path';
import { ContentSuperComponent } from '../../shared/content-super/content-super.component';
import { TeamListComponent } from '../../teams/team-list/team-list.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { BookViewerService } from '../book-viewer/book-viewer.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { BookDetailsStore } from './store/book-details.store';
import { DatePipe } from '@angular/common';
import { PublishersStore } from '../../core/store/publishers/publishers.store';
import { UserBookState } from '../../core/models/user-book-state.interface';

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
        DatePipe,
        MatMiniFabButton,
        RouterLink,
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
    private publisherStore = inject(PublishersStore);

    public readonly id = input.required({ transform: numberAttribute });

    protected readonly book = this.bookDetailsStore.book;
    protected readonly characters = this.bookDetailsStore.characters;
    protected readonly teams = this.bookDetailsStore.teams;
    protected readonly locations = this.bookDetailsStore.locations;
    protected readonly loading = signal(false);
    protected readonly title = this.computeTitle();
    protected readonly previewImageSrc = this.computeThumbSrc();
    protected readonly activeTabIndex = signal(0);
    protected readonly publisher = this.computePublisher();
    protected readonly bookState = this.computeBookState();

    constructor() {
        effect(() => {
            const id = this.id();

            untracked(() => {
                this.bookDetailsStore.setActiveBook(id);
            });
        });
    }

    protected async openBook() {
        await this.bookViewer.openBook(this.book()!.id);
        this.bookDetailsStore.updateItem();
    }

    protected markComplete(complete: boolean) {
        this.booksStore.markComplete(this.book()!, complete);
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

    private computePublisher() {
        return computed(() => {
            const id = this.book()?.publisherId;

            if (id) {
                return this.publisherStore.entityMap()[id]?.name;
            }

            return undefined;
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

    private computeBookState(): Signal<UserBookState | undefined> {
        return computed(() => {
            return this.booksStore.userBookStateMap()[this.id()];
        });
    }
}
