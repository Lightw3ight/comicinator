import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withComputed,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import {
    addEntities,
    addEntity,
    removeEntity,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import store2 from 'store2';
import { BooksApiService } from '../../api/books/books-api.service';
import { ElectronService } from '../../electron.service';
import { Book } from '../../models/book.interface';
import { ComicInfoXml } from '../../models/comic-info-xml.interface';
import { PAGE_SCROLL_SIZE } from '../../models/page-scroll-size.const';
import { SortDirection } from '../../models/sort-direction.type';
import { CharactersStore } from '../characters/characters.store';
import { chunkItems } from '../chunk-items';
import { LocationsStore } from '../locations/locations.store';
import { SortState } from '../models/sort-state.interface';
import { PublishersStore } from '../publishers/publishers.store';
import { TeamsStore } from '../teams/teams.store';
import { BooksState } from './books-state.interface';

const BOOK_STATE_KEY = 'cbx-book-state';

export function withBooksCoreFeature() {
    return signalStoreFeature(
        { state: type<BooksState>() },

        withEntities<Book>(),

        withComputed((store) => {
            return {
                rowCount: computed(() => {
                    return Math.ceil(store.itemCount() / PAGE_SCROLL_SIZE);
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
                persistState() {
                    const state: SortState<Book> = {
                        sortField: store.sortField(),
                        sortDirection: store.sortDirection(),
                    };

                    store2(BOOK_STATE_KEY, state);
                },

                async checkComicAdded(filePath: string) {
                    const existing =
                        await booksApiService.selectByFilePath(filePath);
                    return existing != null;
                },

                async setSorting(
                    field: keyof Book | undefined,
                    dir: SortDirection | undefined,
                ) {
                    patchState(store, {
                        sortField: field ?? store.sortField(),
                        sortDirection: dir ?? store.sortDirection(),
                    });
                    this.persistState();
                },

                async loadBook(id: number) {
                    if (store.entityMap()[id] == null) {
                        const book = await booksApiService.selectById(id);
                        patchState(store, addEntity(book));
                    }
                },

                async loadByGroup(groupField: string, value: string) {
                    const books = await booksApiService.selectByGroup(
                        groupField,
                        value,
                    );
                    patchState(store, addEntities(books));
                    return books.map((o) => o.id);
                },

                setColumnCount(count: number) {
                    if (count !== store.columnCount()) {
                        patchState(store, { columnCount: count });
                    }
                },

                async resetPageData() {
                    const columnCount = store.columnCount();
                    const itemCount = await booksApiService.selectManyCount(
                        store.searchText(),
                    );

                    if (itemCount === 0 || columnCount === 0) {
                        patchState(store, {
                            pagedData: [],
                            pagesLoaded: {},
                            itemCount,
                            columnCount,
                        });
                    } else {
                        const rowCount = Math.ceil(itemCount / columnCount);
                        const pagedData = Array.from<number[]>({
                            length: rowCount,
                        });
                        patchState(store, {
                            pagedData,
                            pagesLoaded: {},
                            itemCount,
                            columnCount,
                        });
                    }
                },

                setSearch(query: string) {
                    if (query !== store.searchText()) {
                        patchState(store, {
                            searchText: query,
                        });
                    }
                },

                clearSearch() {
                    if (store.searchText() != null) {
                        patchState(store, {
                            searchText: undefined,
                        });
                    }
                },

                async clearPageCache() {
                    patchState(store, { pagedData: [], pagesLoaded: {} });
                },

                async loadPage(pageIndex: number) {
                    if (store.pagesLoaded()[pageIndex]) {
                        return;
                    }

                    patchState(store, {
                        pagesLoaded: {
                            ...store.pagesLoaded(),
                            [pageIndex]: true,
                        },
                    });

                    const offset = pageIndex * PAGE_SCROLL_SIZE;
                    const books = await booksApiService.selectMany(
                        store.searchText(),
                        offset,
                        PAGE_SCROLL_SIZE * store.columnCount(),
                        store.sortField(),
                        store.sortDirection(),
                    );
                    const ids = books.map((o) => o.id);
                    const chunkedIds = chunkItems(ids, store.columnCount());
                    const pagedData = [...store.pagedData()];
                    pagedData.splice(
                        pageIndex * PAGE_SCROLL_SIZE,
                        PAGE_SCROLL_SIZE,
                        ...chunkedIds,
                    );
                    patchState(store, addEntities(books), { pagedData });
                },

                async setReadDetails(
                    id: number,
                    currentPage: number,
                    pageCount: number,
                ) {
                    const updatedBook = await booksApiService.setReadDetails(
                        id,
                        currentPage,
                        pageCount,
                    );

                    patchState(
                        store,
                        updateEntity({ id, changes: updatedBook }),
                    );
                },

                async updateBook(
                    book: Omit<Book, 'dateAdded'>,
                    characterIds?: number[],
                    teamIds?: number[],
                    locationIds?: number[],
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

                    patchState(store, addEntity(newBook), {
                        lastBookImport: new Date(),
                    });
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
                    const characters = await charactersStore.searchByBook(
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

                    await this.insertBook(
                        book,
                        characterIds,
                        teamIds,
                        locationIds,
                    );
                },
            };
        }),

        withHooks((store) => {
            return {
                async onInit() {
                    const state = store2(BOOK_STATE_KEY) as SortState<Book>;

                    if (state) {
                        patchState(store, {
                            sortField: state.sortField ?? store.sortField(),
                            sortDirection:
                                state.sortDirection ?? store.sortDirection(),
                        });
                    }
                },
            };
        }),
    );
}
