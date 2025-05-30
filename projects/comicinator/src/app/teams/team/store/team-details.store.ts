import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BooksStore } from '../../../core/store/books/books.store';
import { CharactersStore } from '../../../core/store/characters/characters.store';
import { TeamsStore } from '../../../core/store/teams/teams.store';
import { TEAM_DETAILS_INITIAL_STATE } from './team-details-state.interface';

export const TeamDetailsStore = signalStore(
    withState(TEAM_DETAILS_INITIAL_STATE),
    withMethods((store) => {
        const charactersStore = inject(CharactersStore);
        const booksStore = inject(BooksStore);
        const teamsStore = inject(TeamsStore);

        return {
            async setActiveTeam(id: number) {
                await teamsStore.loadTeam(id);
                const team = teamsStore.entityMap()[id];
                const books = await booksStore.searchByCharacter(id);
                const characters = await charactersStore.searchByTeam(id);

                patchState(store, { team, characters, books });
            },

            async updateItem() {
                const team = teamsStore.entityMap()[store.team()!.id];
                patchState(store, { team });
            },
        };
    }),
);
