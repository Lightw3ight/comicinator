import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { EntityState } from '@ngrx/signals/entities';
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
                    const ids = await locationsApiService.search(query);

                    patchState(store, {
                        activeSearch: {
                            query,
                            results: ids,
                        },
                    });
                },

                clearSearch() {
                    patchState(store, {
                        activeSearch: {
                            query: undefined,
                            results: [],
                        },
                    });
                },
            };
        }),
    );
}
