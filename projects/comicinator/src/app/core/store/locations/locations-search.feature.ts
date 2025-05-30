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
                async quickFind(query: string) {
                    const items = await locationsApiService.selectMany(query);
                    patchState(store, addEntities(items));
                    return items;
                },

                async searchByBook(bookId: number): Promise<Location[]> {
                    return await locationsApiService.selectByBook(bookId);
                },
            };
        }),
    );
}
