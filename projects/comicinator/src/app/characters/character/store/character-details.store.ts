import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BooksStore } from '../../../core/store/books/books.store';
import { CharactersStore } from '../../../core/store/characters/characters.store';
import { CHARACTER_DETAILS_INITIAL_STATE } from './character-details-state.interface';
import { TeamsStore } from '../../../core/store/teams/teams.store';

export const CharacterDetailsStore = signalStore(
    withState(CHARACTER_DETAILS_INITIAL_STATE),
    withMethods((store) => {
        const charactersStore = inject(CharactersStore);
        const booksStore = inject(BooksStore);
        const teamsStore = inject(TeamsStore);

        return {
            async setActiveCharacter(id: number) {
                await charactersStore.loadCharacter(id);
                const character = charactersStore.entityMap()[id];
                const books = await booksStore.searchByCharacter(id);
                const teams = await teamsStore.searchByCharacter(id);

                patchState(store, { character, teams, books });
            },

            async updateItem() {
                const character =
                    charactersStore.entityMap()[store.character()!.id];
                patchState(store, { character });
            },
        };
    }),
);
