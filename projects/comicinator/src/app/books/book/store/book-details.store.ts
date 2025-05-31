import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BooksStore } from '../../../core/store/books/books.store';
import { CharactersStore } from '../../../core/store/characters/characters.store';
import { BOOK_DETAILS_INITIAL_STATE } from './book-details-state.interface';
import { TeamsStore } from '../../../core/store/teams/teams.store';
import { LocationsStore } from '../../../core/store/locations/locations.store';

export const BookDetailsStore = signalStore(
    withState(BOOK_DETAILS_INITIAL_STATE),
    withMethods((store) => {
        const charactersStore = inject(CharactersStore);
        const bookStore = inject(BooksStore);
        const teamStore = inject(TeamsStore);
        const locationStore = inject(LocationsStore);

        return {
            async setActiveBook(id: number) {
                await bookStore.loadBook(id);
                const book = bookStore.entityMap()[id];
                const characters = await charactersStore.searchByBook(id);
                const teams = await teamStore.selectByBook(id);
                const locations = await locationStore.searchByBook(id);

                patchState(store, { book, characters, teams, locations });
            },

            async updateItem() {
                const book = bookStore.entityMap()[store.book()!.id];
                patchState(store, { book });
            },
        };
    }),
);
