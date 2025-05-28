import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withComputed,
    withMethods,
} from '@ngrx/signals';
import {
    addEntities,
    addEntity,
    removeEntity,
    setAllEntities,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { BooksApiService } from '../../api/books/books-api.service';
import { ElectronService } from '../../electron.service';
import { Book } from '../../models/book.interface';
import { ComicInfoXml } from '../../models/comic-info-xml.interface';
import { LoadState } from '../../models/load-state.enum';
import { CharactersStore } from '../characters/characters.store';
import { LocationsStore } from '../locations/locations.store';
import { PublishersStore } from '../publishers/publishers.store';
import { TeamsStore } from '../teams/teams.store';
import { BooksState } from './books-state.interface';

export function withBooksCoreFeature() {
    return signalStoreFeature(
        { state: type<BooksState>() },

        withEntities<Book>(),

        withComputed((store) => {
            return {
                displayItems: computed(() => {
                    const search = store.searchText();
                    const em = store.entityMap();
                    let bookIds =
                        store.quickSearchResultCache()[store.quickSearch()] ??
                        [];

                    if (search?.length) {
                        bookIds = store.activeDisplayIds();
                    }

                    return bookIds.map((id) => em[id]);
                }),
            };
        }),

        withMethods((store) => {
            const booksApiService = inject(BooksApiService);
            const charactersStore = inject(CharactersStore);
            const publishersStore = inject(PublishersStore);
            const teamsStore = inject(TeamsStore);
            const locationsStore = inject(LocationsStore);
            const electron = inject(ElectronService);

            return {
                async checkComicAdded(filePath: string) {
                    const existing =
                        await booksApiService.selectByFilePath(filePath);
                    return existing != null;
                },

                async loadByGroup(groupField: string, value: string) {
                    const books = await booksApiService.selectByGroup(
                        groupField,
                        value,
                    );
                    patchState(store, addEntities(books));
                    return books.map((o) => o.id);
                },

                async runQuickSearch(filter: string, clearCache = false) {
                    patchState(store, { quickSearch: filter });

                    if (
                        store.quickSearchResultCache()[filter] != null &&
                        clearCache === false
                    ) {
                        return;
                    }

                    const books = await booksApiService.startsWith(filter);

                    patchState(store, addEntities(books), {
                        quickSearch: filter,
                        quickSearchResultCache: {
                            ...store.quickSearchResultCache(),
                            [filter]: books.map((o) => o.id),
                        },
                    });
                },

                async loadBooks() {
                    if (store.loadState() !== LoadState.Initial) {
                        return;
                    }

                    patchState(store, { loadState: LoadState.Loading });
                    const books = await booksApiService.selectAll();

                    patchState(store, setAllEntities(books));
                },

                async updateBook(
                    book: Omit<Book, 'dateAdded'>,
                    characterIds: number[],
                    teamIds: number[],
                    locationIds: number[],
                ) {
                    await booksApiService.update(
                        book,
                        characterIds,
                        teamIds,
                        locationIds,
                    );

                    patchState(
                        store,
                        updateEntity({ id: book.id, changes: book }),
                    );
                },

                async insertBook(
                    book: Omit<Book, 'dateAdded' | 'id'>,
                    characterIds: number[],
                    teamIds: number[],
                    locationIds: number[],
                ) {
                    const newBook = await booksApiService.create(
                        book,
                        characterIds,
                        teamIds,
                        locationIds,
                    );

                    patchState(store, addEntity(newBook));
                },

                async deleteBook(bookId: number, removeFile: boolean) {
                    await booksApiService.remove(bookId, removeFile);

                    patchState(store, removeEntity(bookId));
                },

                async saveComicInfoXml(book: Book) {
                    const publisher =
                        book.publisherId != null
                            ? publishersStore.entityMap()[book.publisherId]
                                  ?.name
                            : undefined;
                    const characters = await charactersStore.selectByBook(
                        book.id,
                    );
                    const teams = await teamsStore.selectByBook(book.id);

                    const xml: ComicInfoXml = {
                        Title: book.title,
                        Series: book.series,
                        Number: book.number?.toString(),
                        Volume: book.volume?.toString(),
                        Summary: book.summary,
                        Notes: 'Scraped metadata from ComicVine',
                        Year: book.coverDate?.getFullYear().toString(),
                        Month: book.coverDate
                            ? (book.coverDate.getMonth() + 1).toString()
                            : undefined,
                        Day: book.coverDate?.getDate().toString(),
                        Writer: book.writer,
                        Penciller: book.penciler,
                        Inker: book.inker,
                        Colorist: book.colorist,
                        Letterer: book.letterer,
                        CoverArtist: book.coverArtist,
                        Publisher: publisher,
                        Web: book.externalUrl,
                        Characters: characters.map((o) => o.name).join(', '),
                        Teams: teams.map((o) => o.name).join(', '),
                    };

                    await electron.zipWriteXml(book.filePath, 'ComicInfo.xml', {
                        ComicInfo: {
                            $: {
                                'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
                                'xmlns:xsi':
                                    'http://www.w3.org/2001/XMLSchema-instance',
                            },
                            ...xml,
                        },
                    });
                },

                async importBook(filePath: string, xml?: ComicInfoXml) {
                    const existing =
                        await booksApiService.selectByFilePath(filePath);

                    if (existing) {
                        return;
                    }

                    const locationIds = await locationsStore.addByName(
                        xml?.Locations,
                    );

                    const characterIds =
                        await charactersStore.addCharactersByName(
                            xml?.Characters,
                        );
                    const teamIds = await teamsStore.addTeamsByName(xml?.Teams);

                    let fileName = filePath.replaceAll('/', '\\');
                    fileName = fileName.substring(
                        fileName.lastIndexOf('\\') + 1,
                        fileName.lastIndexOf('.'),
                    );
                    let coverDate: Date | undefined;
                    let publisherId: number | undefined;

                    if (xml?.Publisher) {
                        publisherId = (
                            await publishersStore.findPublisher(
                                undefined,
                                xml.Publisher,
                            )
                        )?.id;

                        if (publisherId == null) {
                            publisherId = await publishersStore.addPublisher({
                                name: xml.Publisher,
                            });
                        }
                    }

                    if (xml?.Year && !isNaN(Number(xml.Year))) {
                        const { Year, Month, Day } = xml;
                        const year = Number(Year);
                        const month = isNaN(Number(Month))
                            ? 0
                            : Number(Month) - 1;
                        const day = isNaN(Number(Day)) ? 0 : Number(Day);
                        coverDate = new Date(year, month, day);
                    }

                    const book: Omit<Book, 'id'> = {
                        filePath: filePath,
                        title: xml?.Title ?? fileName,
                        dateAdded: new Date(),
                        colorist: xml?.Colorist,
                        coverArtist: xml?.CoverArtist,
                        coverDate: coverDate,
                        editor: xml?.Editor,
                        inker: xml?.Inker,
                        //filesize
                        letterer: xml?.Letterer,
                        notes: xml?.Notes,
                        number: xml?.Number ? Number(xml?.Number) : undefined,
                        // pageCount
                        penciler: xml?.Penciller,
                        publisherId: publisherId,
                        series: xml?.Series,
                        summary: xml?.Summary,
                        volume: xml?.Volume ? Number(xml?.Volume) : undefined,
                        writer: xml?.Writer,
                        externalUrl: xml?.Web,
                    };

                    const newBook = await booksApiService.create(
                        book,
                        characterIds,
                        teamIds,
                        locationIds,
                    );

                    patchState(store, addEntity(newBook));
                },
            };
        }),
    );
}
