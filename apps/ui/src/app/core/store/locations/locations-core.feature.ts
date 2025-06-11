import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import {
    addEntities,
    addEntity,
    removeEntity,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { LocationResult } from '../../api/comic-vine/models/location-result.interface';
import { LocationsApiService } from '../../api/locations/locations-api.service';
import { Location } from '../../models/location.interface';
import { PAGE_SCROLL_SIZE } from '../../models/page-scroll-size.const';
import { SortDirection } from '../../models/sort-direction.type';
import { chunkItems } from '../chunk-items';
import { LocationsState } from './locations-state.interface';
import { SortState } from '../models/sort-state.interface';
import store2 from 'store2';

const LOCATION_STATE_KEY = 'cbx-location-state';

export function withLocationsCoreFeature() {
    return signalStoreFeature(
        { state: type<LocationsState>() },

        withEntities<Location>(),

        withMethods((store) => {
            const locationsApiService = inject(LocationsApiService);

            return {
                persistState() {
                    const state: SortState<Location> = {
                        sortField: store.sortField(),
                        sortDirection: store.sortDirection(),
                    };

                    store2(LOCATION_STATE_KEY, state);
                },

                setColumnCount(count: number) {
                    if (count !== store.columnCount()) {
                        patchState(store, { columnCount: count });
                    }
                },

                setSorting(field: keyof Location, dir: SortDirection) {
                    patchState(store, {
                        sortField: field,
                        sortDirection: dir,
                    });
                    this.persistState();
                },

                async resetPageData() {
                    const columnCount = store.columnCount();
                    const itemCount = await locationsApiService.selectManyCount(
                        store.searchText()
                    );

                    if (itemCount === 0 || columnCount === 0) {
                        patchState(store, {
                            pagedData: [],
                            pagesLoaded: {},
                            itemCount,
                            columnCount,
                        });
                    } else {
                        const rowCount = Math.ceil(itemCount / columnCount);
                        const pagedData = Array.from<number[]>({
                            length: rowCount,
                        });
                        patchState(store, {
                            pagedData,
                            pagesLoaded: {},
                            itemCount,
                            columnCount,
                        });
                    }
                },

                setSearch(query: string) {
                    if (query !== store.searchText()) {
                        patchState(store, {
                            searchText: query,
                        });
                    }
                },

                clearSearch() {
                    if (store.searchText() != null) {
                        patchState(store, {
                            searchText: undefined,
                        });
                    }
                },

                async loadPage(pageIndex: number) {
                    if (store.pagesLoaded()[pageIndex]) {
                        return;
                    }

                    patchState(store, {
                        pagesLoaded: {
                            ...store.pagesLoaded(),
                            [pageIndex]: true,
                        },
                    });

                    const offset = pageIndex * PAGE_SCROLL_SIZE;
                    const books = await locationsApiService.selectMany(
                        store.searchText(),
                        offset,
                        PAGE_SCROLL_SIZE * store.columnCount(),
                        store.sortField(),
                        store.sortDirection()
                    );
                    const ids = books.map((o) => o.id);
                    const chunkedIds = chunkItems(ids, store.columnCount());
                    const pagedData = [...store.pagedData()];
                    pagedData.splice(
                        pageIndex * PAGE_SCROLL_SIZE,
                        PAGE_SCROLL_SIZE,
                        ...chunkedIds
                    );
                    patchState(store, addEntities(books), { pagedData });
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
                        (id) => store.entityMap()[id] == null
                    );
                    if (toLoad.length > 0) {
                        const items = await locationsApiService.selectByIds(
                            toLoad
                        );
                        patchState(store, addEntities(items));
                    }
                },

                async selectImage(teamId: number): Promise<Blob | undefined> {
                    return await locationsApiService.selectImage(teamId);
                },

                async removeLocation(locationId: number) {
                    await locationsApiService.remove(locationId);
                    patchState(store, removeEntity(locationId));
                },

                async importLocation(data: LocationResult): Promise<number> {
                    let image: Blob | undefined;
                    if (
                        !data.image.originalUrl
                            .toLocaleLowerCase()
                            .endsWith('blank.png')
                    ) {
                        try {
                            const response = await fetch(
                                data.image.originalUrl
                            );
                            image = await response.blob();
                        } catch {
                            image = undefined;
                        }
                    }

                    const newChar: Omit<Location, 'id' | 'dateAdded'> = {
                        name: data.name,
                        description: data.description,
                        externalId: data.id,
                        externalUrl: data.siteUrl,
                    };

                    return await this.addLocation(newChar, image, false);
                },

                async addLocation(
                    location: Omit<Location, 'id' | 'dateAdded'>,
                    image: Blob | undefined,
                    checkForExisting = true
                ): Promise<number> {
                    if (checkForExisting) {
                        const existing =
                            await locationsApiService.findForImport(
                                undefined,
                                location.name
                            );

                        if (existing) {
                            return existing.id;
                        }
                    }

                    const added = await locationsApiService.create(
                        location,
                        image
                    );

                    patchState(store, addEntity(added));

                    return added.id;
                },

                async updateLocation(
                    id: number,
                    location: Partial<Location>,
                    image: Blob | undefined
                ) {
                    const updatedLocation = await locationsApiService.update(
                        id,
                        location,
                        image
                    );

                    patchState(
                        store,
                        updateEntity({ id: id, changes: updatedLocation })
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

                    for (const name of names) {
                        const id = await this.addLocation(
                            {
                                name,
                            },
                            undefined
                        );
                        locationIds.push(id);
                    }

                    return locationIds;
                },
            };
        }),

        withHooks((store) => {
            return {
                async onInit() {
                    const state = store2(
                        LOCATION_STATE_KEY
                    ) as SortState<Location>;

                    if (state) {
                        patchState(store, {
                            sortField: state.sortField ?? store.sortField(),
                            sortDirection:
                                state.sortDirection ?? store.sortDirection(),
                        });
                    }
                },
            };
        })
    );
}
