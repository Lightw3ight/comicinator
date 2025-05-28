import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { addEntities, EntityState } from '@ngrx/signals/entities';
import { LocationsApiService } from '../../api/locations/locations-api.service';
import { Location } from '../../models/location.interface';
import { LocationsState } from './locations-state.interface';

export function withLocationsSearchFeature<_>() {
    return signalStoreFeature(
        { state: type<LocationsState & EntityState<Location>>() },

        withMethods((store) => {
            const locationsApiService = inject(LocationsApiService);

            return {
                async search(query: string) {
                    const locations = await locationsApiService.search(query);
                    patchState(store, addEntities(locations));
                    return locations;
                },

                async searchByBook(bookId: number): Promise<Location[]> {
                    return await locationsApiService.selectByBook(bookId);
                },

                async setActiveSearch(query: string) {
                    const locations = await this.search(query);

                    patchState(store, addEntities(locations), {
                        search: query,
                        activeDisplayIds: locations.map((o) => o.id),
                    });
                },

                clearSearch() {
                    patchState(store, {
                        search: undefined,
                        activeDisplayIds: [],
                    });
                },
            };
        }),
    );
}
