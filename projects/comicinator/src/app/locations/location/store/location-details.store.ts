import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BooksStore } from '../../../core/store/books/books.store';
import { LocationsStore } from '../../../core/store/locations/locations.store';
import { LOCATION_DETAILS_INITIAL_STATE } from './location-details-state.interface';

export const LocationDetailsStore = signalStore(
    withState(LOCATION_DETAILS_INITIAL_STATE),
    withMethods((store) => {
        const locationsStore = inject(LocationsStore);
        const booksStore = inject(BooksStore);

        return {
            async setActiveTeam(id: number) {
                await locationsStore.loadLocation(id);
                const location = locationsStore.entityMap()[id];
                const books = await booksStore.searchByCharacter(id);

                patchState(store, { location, books });
            },

            async updateItem() {
                const location =
                    locationsStore.entityMap()[store.location()!.id];
                patchState(store, { location });
            },
        };
    }),
);
