import {
    patchState,
    signalStore,
    withComputed,
    withHooks,
    withMethods,
    withState,
} from '@ngrx/signals';
import {
    addEntity,
    removeEntity,
    setEntities,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { Library } from '../../models/library.interface';
import { INITIAL_LIBRARY_STATE } from './library-state.interface';
import { computed, inject } from '@angular/core';
import { LibraryApiService } from '../../api/library/library-api.service';
import { LibraryFilter } from '../../models/library-filter.interface';

export const LibraryStore = signalStore(
    { providedIn: 'root' },
    withEntities<Library>(),
    withState(INITIAL_LIBRARY_STATE),
    withComputed((store) => {
        return {
            quickList: computed(() => {
                return store.entities().filter((o) => o.showInQuickList);
            }),
        };
    }),
    withMethods((store) => {
        const libraryApiService = inject(LibraryApiService);

        return {
            async loadLibraries() {
                const libs = await libraryApiService.selectAll();
                patchState(store, setEntities(libs));
            },

            async loadFilters(libraryId: number) {
                const filters =
                    await libraryApiService.selectFilters(libraryId);
                patchState(store, {
                    filters: {
                        ...store.filters(),
                        [libraryId]: filters,
                    },
                });
            },

            async create(
                lib: Omit<Library, 'id' | 'dateAdded'>,
                filters: LibraryFilter[],
            ) {
                const newLib = await libraryApiService.create(lib, filters);
                patchState(store, addEntity(newLib));
                await this.loadFilters(newLib.id);
            },

            async update(
                id: number,
                lib: Partial<Library>,
                filters: LibraryFilter[],
            ) {
                await libraryApiService.update(id, lib, filters);
                patchState(store, updateEntity({ id, changes: lib }));
                await this.loadFilters(id);
            },

            async remove(libraryId: number) {
                await libraryApiService.remove(libraryId);
                patchState(store, removeEntity(libraryId));
            },
        };
    }),
    withHooks((store) => {
        return {
            async onInit() {
                await store.loadLibraries();
            },
        };
    }),
);
