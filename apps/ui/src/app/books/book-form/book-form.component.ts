import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { firstValueFrom } from 'rxjs';
import { BookResult } from '../../core/api/comic-vine/models/book-result.interface';
import { VolumeResult } from '../../core/api/comic-vine/models/volume-result.interface';
import { Book } from '../../core/models/book.interface';
import { BooksStore } from '../../core/store/books/books.store';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { PublishersStore } from '../../core/store/publishers/publishers.store';
import { SettingsStore } from '../../core/store/settings/settings.store';
import { TeamsStore } from '../../core/store/teams/teams.store';
import { bookThumbSrc } from '../../shared/book-thumb-path';
import { CharacterSelectorComponent } from '../../shared/character-selector/character-selector.component';
import { TeamSelectorComponent } from '../../shared/team-selector/team-selector.component';
import { BookSearchResultsComponent } from './book-search-results/book-search-results.component';

import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ComicVineService } from '../../core/api/comic-vine/comic-vine-api.service';
import { FileSystemService } from '../../core/file-system.service';
import { AbortedImport } from '../../core/importers/aborted-import';
import { ImporterService } from '../../core/importers/importer.service';
import { MessagingService } from '../../core/messaging/messaging.service';
import { LocationsStore } from '../../core/store/locations/locations.store';
import { LocationSelectorComponent } from '../../shared/location-selector/location-selector.component';
import { ProgressTakeoverComponent } from '../../shared/progress-takeover/progress-takeover.component';

@Component({
    selector: 'cbx-book-form',
    templateUrl: 'book-form.component.html',
    styleUrl: 'book-form.component.scss',
    providers: [provideNativeDateAdapter()],
    imports: [
        CommonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatButtonModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatInputModule,
        MatRadioModule,
        MatTabsModule,
        MatFormFieldModule,
        MatSelectModule,
        CharacterSelectorComponent,
        TeamSelectorComponent,
        MatCheckboxModule,
        ProgressTakeoverComponent,
        LocationSelectorComponent,
        CdkDrag,
        CdkDragHandle,
    ],
})
export class BookFormComponent implements OnInit {
    private dialog = inject(MatDialog);
    private booksStore = inject(BooksStore);
    private charactersStore = inject(CharactersStore);
    private settingsStore = inject(SettingsStore);
    private publishersStore = inject(PublishersStore);
    private teamsStore = inject(TeamsStore);
    private dialogRef = inject(MatDialogRef<BookFormComponent>);
    private formBuilder = inject(NonNullableFormBuilder);
    private locationsStore = inject(LocationsStore);
    private importerService = inject(ImporterService);
    private messagingService = inject(MessagingService);
    private fileSystem = inject(FileSystemService);
    private comicVineService = inject(ComicVineService);
    protected book = inject<Book>(MAT_DIALOG_DATA, { optional: true });

    protected importing = signal<boolean>(false);
    protected progressText = signal<string | undefined>(undefined);
    protected bookThumbUrl = this.book
        ? bookThumbSrc(this.book.filePath)
        : undefined;
    protected saveXml = signal(false);
    protected publishers = this.publishersStore.entities;
    protected imageUrl = signal<string | undefined>(undefined);
    protected imageBlob = signal<Blob | undefined>(undefined);
    protected form = this.createForm();
    protected showSearch = computed(
        () => !!this.settingsStore.settings.apiKey(),
    );

    public async ngOnInit() {
        if (this.book) {
            const characters = await this.charactersStore.searchByBook(
                this.book.id,
            );
            const teams = await this.teamsStore.selectByBook(this.book.id);
            const locations = await this.locationsStore.searchByBook(
                this.book.id,
            );

            this.form.patchValue({
                characterIds: characters.map((c) => c.id),
                teamIds: teams.map((o) => o.id),
                locationIds: locations.map((o) => o.id),
            });
            this.form.markAsPristine();
        }
    }

    protected openFileLocation() {
        if (this.book) {
            this.fileSystem.showItemInFolder(this.book.filePath);
        }
    }

    protected async save() {
        const { characterIds, teamIds, locationIds, ...formValue } =
            this.form.value;

        if (this.book != null) {
            this.progressText.set('Saving book');
            this.dialogRef.disableClose = true;

            this.importing.set(true);
            const { dateAdded, ...book } = this.book;

            await this.booksStore.updateBook(
                {
                    ...book,
                    ...formValue,
                },
                characterIds ?? [],
                teamIds ?? [],
                locationIds ?? [],
            );

            const updatedBook = this.booksStore.entityMap()[this.book.id];

            if (this.saveXml()) {
                this.progressText.set('Writing xml book data');
                try {
                    await this.booksStore.saveComicInfoXml(updatedBook);
                } catch (err: any) {
                    this.messagingService.error(
                        `An error occurred while writing xml data to ${updatedBook.filePath}`,
                    );
                }
            }
            this.importing.set(false);
            this.dialogRef.close();
        }
    }

    private getSearchParams() {
        let { series, volume, number } = this.form.value;
        const filePath = this.book?.filePath;

        if (
            (series == null || volume == null || number == null) &&
            filePath != null
        ) {
            const rx = /^(.*?) (\d{1,3}) \((\d{4})\)/;
            const filePath = this.book?.filePath.replaceAll('/', '\\');

            const match = filePath!
                .substring(filePath!.lastIndexOf('\\') + 1)
                .match(rx);

            if (match) {
                series = series ?? match[1];
                number = match[2];
                volume = volume ?? Number(match[3]);
            }
        }

        return {
            series,
            number,
            volume,
        };
    }

    protected async refreshFromApi() {
        const issueId = this.book?.externalId;
        if (issueId) {
            this.importing.set(true);
            const issue = await this.comicVineService.getBook(issueId);

            if (issue.volume?.id == null) {
                this.messagingService.error('Comic has no volume');
                return;
            }

            const volume = await this.comicVineService.getVolume(
                issue.volume!.id,
            );

            await this.processApiResult(issue, volume);
        }
    }

    private async processApiResult(issue: BookResult, volume: VolumeResult) {
        this.importing.set(true);

        try {
            const { book, ...ids } = await this.importerService.importBook(
                issue,
                volume,
                (progress) => this.progressText.set(progress),
            );

            if (ids.teamIds.length) {
                await this.teamsStore.loadByIds(ids.teamIds);
            }

            if (ids.characterIds.length) {
                await this.charactersStore.loadByIds(ids.characterIds);
            }

            if (ids.locationIds.length) {
                await this.locationsStore.loadByIds(ids.locationIds);
            }

            this.form.patchValue({
                ...book,
                ...ids,
            });
        } catch (err: unknown) {
            if (err instanceof AbortedImport) {
                this.messagingService.warning('Book import aborted');
            } else {
                this.messagingService.error(
                    'An error occured while importing book information',
                );
            }
        } finally {
            this.importing.set(false);
        }
    }

    protected async scan() {
        const { series, number, volume } = this.getSearchParams();

        if (series) {
            const ref = this.dialog.open(BookSearchResultsComponent, {
                data: {
                    series,
                    number,
                    volume,
                    filePath: this.book?.filePath,
                },
                minWidth: 900,
                minHeight: 200,
                disableClose: true,
            });
            const response = (await firstValueFrom(ref.afterClosed())) as {
                issue: BookResult;
                volume: VolumeResult;
            };

            if (response) {
                const { issue, volume } = response;
                await this.processApiResult(issue, volume);
            }
        }
    }

    private createForm() {
        const form = this.formBuilder.group({
            title: ['', Validators.required],
            series: [''],
            number: [undefined as string | undefined],
            coverDate: [undefined as Date | undefined],
            volume: [undefined as number | undefined],
            writer: [''],
            penciler: [''],
            inker: [''],
            colorist: [''],
            letterer: [''],
            coverArtist: [''],
            editor: [''],
            publisherId: [undefined as number | undefined],
            externalUrl: [''],
            characterIds: [[] as Array<number>],
            teamIds: [[] as Array<number>],
            locationIds: [[] as Array<number>],
            externalId: [undefined as number | undefined],
        });

        if (this.book) {
            form.patchValue(this.book);
            form.markAsPristine();
        }

        return form;
    }
}
