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
    setAllEntities,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { LocationResult } from '../../api/comic-vine/models/location-result.interface';
import { LocationsApiService } from '../../api/locations/locations-api.service';
import { LoadState } from '../../models/load-state.enum';
import { Location } from '../../models/location.interface';
import { LocationsState } from './locations-state.interface';

export function withLocationsCoreFeature() {
    return signalStoreFeature(
        { state: type<LocationsState>() },

        withEntities<Location>(),

        withComputed((store) => {
            return {
                displayItems: computed(() => {
                    const search = store.search();
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
            const locationsApiService = inject(LocationsApiService);

            return {
                async runQuickSearch(filter: string) {
                    patchState(store, { quickSearch: filter });

                    if (store.quickSearchResultCache()[filter] != null) {
                        return;
                    }

                    const items = await locationsApiService.startsWith(filter);

                    patchState(store, addEntities(items), {
                        quickSearch: filter,
                        quickSearchResultCache: {
                            ...store.quickSearchResultCache(),
                            [filter]: items.map((o) => o.id),
                        },
                    });
                },

                async loadLocation(id: number) {
                    if (store.entityMap()[id] != null) {
                        return;
                    }

                    const char = await locationsApiService.selectById(id);
                    patchState(store, addEntity(char));
                },

                async loadByIds(ids: number[]) {
                    const toLoad = ids.filter(
                        (id) => store.entityMap()[id] == null,
                    );
                    if (toLoad.length > 0) {
                        const items =
                            await locationsApiService.selectByIds(toLoad);
                        patchState(store, addEntities(items));
                    }
                },

                async loadLocations() {
                    if (store.loadState() !== LoadState.Initial) {
                        return;
                    }

                    patchState(store, { loadState: LoadState.Loading });
                    const locations = await locationsApiService.selectAll();

                    patchState(store, setAllEntities(locations), {
                        loadState: LoadState.Loaded,
                    });
                },

                async selectImage(teamId: number): Promise<Blob | undefined> {
                    return await locationsApiService.selectImage(teamId);
                },

                async importLocation(data: LocationResult): Promise<number> {
                    let image: Blob | undefined;
                    try {
                        const response = await fetch(data.image.originalUrl);
                        image = await response.blob();
                    } catch {}

                    const newChar: Omit<Location, 'id' | 'dateAdded'> = {
                        name: data.name,
                        description: data.description,
                        externalId: data.id,
                        externalUrl: data.siteUrl,
                    };

                    return await this.addLocation(newChar, image);
                },

                async addLocation(
                    location: Omit<Location, 'id' | 'dateAdded'>,
                    image: Blob | undefined,
                ): Promise<number> {
                    const existing = await locationsApiService.findForImport(
                        null,
                        location.name,
                    );

                    if (existing) {
                        return existing.id;
                    }

                    const added = await locationsApiService.create(
                        location,
                        image,
                    );

                    patchState(store, addEntity(added));

                    return added.id;
                },

                async updateLocation(
                    id: number,
                    location: Partial<Location>,
                    image: Blob | undefined,
                ) {
                    const updatedLocation = await locationsApiService.update(
                        id,
                        location,
                        image,
                    );

                    patchState(
                        store,
                        updateEntity({ id: id, changes: updatedLocation }),
                    );
                },

                async addByName(commaDelimitedNames: string | undefined) {
                    if (
                        commaDelimitedNames == null ||
                        commaDelimitedNames.trim().length === 0
                    ) {
                        return [];
                    }

                    const names = commaDelimitedNames
                        .split(',')
                        .map((t) => t.trim());
                    const locationIds: number[] = [];

                    for (let name of names) {
                        const id = await this.addLocation(
                            {
                                name,
                            },
                            undefined,
                        );
                        locationIds.push(id);
                    }

                    return locationIds;
                },
            };
        }),
    );
}
