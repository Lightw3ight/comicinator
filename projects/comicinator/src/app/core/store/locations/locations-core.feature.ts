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
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { LocationsApiService } from '../../api/locations/locations-api.service';
import { Location } from '../../models/location.interface';
import { Team } from '../../models/team.interface';
import { CharactersStore } from '../characters/characters.store';
import { PublishersStore } from '../publishers/publishers.store';
import { LocationsState } from './locations-state.interface';
import { BooksApiService } from '../../api/books/books-api.service';
import { LocationResult } from '../../api/comic-vine/models/location-result.interface';

export function withLocationsCoreFeature() {
    return signalStoreFeature(
        { state: type<LocationsState>() },

        withEntities<Location>(),

        withComputed((store) => {
            return {
                pageView: computed(() => {
                    const search = store.activeSearch.query();

                    if (search == null || search === '') {
                        return store.entities();
                    }

                    const em = store.entityMap();
                    return store.activeSearch.results().map((id) => em[id]);
                }),
            };
        }),

        withMethods((store) => {
            const locationsApiService = inject(LocationsApiService);
            const booksApiService = inject(BooksApiService);
            const publishersStore = inject(PublishersStore);
            const charactersStore = inject(CharactersStore);

            return {
                async loadLocations() {
                    const locations =
                        await locationsApiService.fetchLocations();
                    const names = locations.reduce(
                        (acc, c) => ({
                            ...acc,
                            [c.name.trim().toLocaleLowerCase()]: c.id,
                        }),
                        {},
                    );

                    patchState(store, setAllEntities(locations), {
                        loaded: true,
                        names,
                    });
                },

                async setActiveLocation(locationId: number) {
                    const bookIds =
                        await booksApiService.selectByLocation(locationId);

                    patchState(store, {
                        activeLocation: {
                            locationId,
                            bookIds,
                        },
                    });
                },

                async selectIdsByBook(bookId: number): Promise<number[]> {
                    return await locationsApiService.selectByBook(bookId);
                },

                async selectByBook(bookId: number): Promise<Team[]> {
                    const ids = await locationsApiService.selectByBook(bookId);
                    return ids.map((id) => store.entityMap()[id]);
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
                        image: image,
                    };

                    return await this.addLocation(newChar);
                },

                async addLocation(
                    location: Omit<Location, 'id' | 'dateAdded'>,
                ): Promise<number> {
                    const existingId =
                        store.names()[location.name.trim().toLocaleLowerCase()];

                    if (existingId) {
                        return existingId;
                    }

                    const added =
                        await locationsApiService.insertLocation(location);

                    patchState(store, addEntity(added), {
                        names: {
                            ...store.names(),
                            [added.name.trim().toLocaleLowerCase()]: added.id,
                        },
                    });

                    return added.id;
                },

                async updateLocation(id: number, location: Partial<Team>) {
                    await locationsApiService.updateLocation(id, location);

                    patchState(
                        store,
                        updateEntity({ id: id, changes: location }),
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
                        const id = await this.addLocation({
                            name,
                        });
                        locationIds.push(id);
                    }

                    return locationIds;
                },
            };
        }),

        withHooks({
            async onInit(store) {
                await store.loadLocations();
            },
        }),
    );
}
