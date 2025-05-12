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
    addEntity,
    setAllEntities,
    withEntities,
} from '@ngrx/signals/entities';
import { BooksApiService } from '../../api/books/books-api.service';
import { Book } from '../../models/book.interface';
import { ComicInfoXml } from '../../models/comic-info-xml.interface';
import { BooksState } from './books-state.interface';
import { CharactersStore } from '../characters/characters.store';
import { TeamsStore } from '../teams/teams.store';

export function withBooksCoreFeature() {
    return signalStoreFeature(
        { state: type<BooksState>() },

        withEntities<Book>(),

        withComputed((store) => {
            return {
                searchResults: computed(() => {
                    const entityMap = store.entityMap();
                    return store.searchResultIds().map((id) => entityMap[id]);
                }),
            };
        }),

        withMethods((store) => {
            const booksApiService = inject(BooksApiService);
            const charactersStore = inject(CharactersStore);
            const teamsStore = inject(TeamsStore);

            return {
                checkComicAdded(filePath: string) {
                    return store.paths()[filePath.toLocaleLowerCase()] ?? false;
                },

                async loadBooks() {
                    const books = await booksApiService.fetchAllBooks();
                    const paths = books.reduce(
                        (acc, b) => ({
                            ...acc,
                            [b.filePath.toLocaleLowerCase()]: true,
                        }),
                        {}
                    );

                    patchState(store, setAllEntities(books), {
                        loaded: true,
                        paths,
                    });
                },

                async importBook(filePath: string, xml?: ComicInfoXml) {
                    if (store.paths()[filePath.toLocaleLowerCase()]) {
                        return;
                    }

                    const characterIds =
                        await charactersStore.addCharactersByName(
                            xml?.Characters
                        );
                    const teamIds = await teamsStore.addTeamsByName(xml?.Teams);

                    let fileName = filePath.replaceAll('/', '\\');
                    fileName = fileName.substring(
                        fileName.lastIndexOf('\\') + 1,
                        fileName.lastIndexOf('.')
                    );

                    const book: Omit<Book, 'id'> = {
                        filePath: filePath,
                        title: xml?.Title ?? fileName,
                        dateAdded: new Date(),
                        colorist: xml?.Colorist,
                        coverArtist: xml?.CoverArtist,
                        day: xml?.Day ? Number(xml?.Day) : undefined,
                        editor: xml?.Editor,
                        inker: xml?.Inker,
                        //filesize
                        letterer: xml?.Letterer,
                        month: xml?.Month ? Number(xml?.Month) : undefined,
                        notes: xml?.Notes,
                        number: xml?.Number ? Number(xml?.Number) : undefined,
                        // pageCount
                        penciler: xml?.Penciller,
                        publisher: xml?.Publisher,
                        series: xml?.Series,
                        summary: xml?.Summary,
                        volume: xml?.Volume ? Number(xml?.Volume) : undefined,
                        writer: xml?.Writer,
                        year: xml?.Year ? Number(xml?.Year) : undefined,
                    };

                    const newBook = await booksApiService.insertBook(
                        book,
                        characterIds,
                        teamIds
                    );

                    patchState(store, addEntity(newBook), {
                        paths: {
                            ...store.paths(),
                            [newBook.filePath]: true,
                        },
                    });
                },
            };
        }),
        withHooks({
            async onInit(store) {
                await store.loadBooks();
            },
        })
    );
}
