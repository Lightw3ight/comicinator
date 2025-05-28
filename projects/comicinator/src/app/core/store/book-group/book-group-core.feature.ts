import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import { BooksApiService } from '../../api/books/books-api.service';
import { Book } from '../../models/book.interface';
import { FilterOperator } from '../../models/filter-operator.type';
import { BooksStore } from '../books/books.store';
import { BookGroupState } from './book-group-state.interface';

const ACTIVE_GROUP_FIELD_KEY = 'cbx-book-group';

export function withBookGroupCoreFeature() {
    return signalStoreFeature(
        { state: type<BookGroupState>() },

        withMethods((store) => {
            const bookApiService = inject(BooksApiService);
            const bookStore = inject(BooksStore);

            return {
                selectGroupBooks(groupValue: string) {
                    return computed(() => {
                        return store.groupBooks()[groupValue];
                    });
                },

                setActiveGroupBy(field: keyof Book) {
                    let groupBooks = { ...store.groupBooks() };

                    if (field !== store.groupField()) {
                        groupBooks = {};
                    }

                    patchState(store, {
                        groupField: field,
                        search: store.search() ?? 'a',
                        searchOperator: store.searchOperator() ?? 'starts-with',
                        groups: [],
                        groupBooks,
                    });
                },

                clearGrouping() {
                    patchState(store, {
                        groupField: undefined,
                        groups: [],
                        groupBooks: {},
                    });

                    localStorage.removeItem(ACTIVE_GROUP_FIELD_KEY);
                },

                async loadGroups(filter: string, operator: FilterOperator) {
                    const groups = await bookApiService.groupBy(
                        store.groupField()!,
                        filter,
                        operator === 'contains',
                    );

                    patchState(store, {
                        groups,
                        search: filter,
                        searchOperator: operator,
                    });
                },

                async reloadGroups() {
                    const field = store.groupField();
                    if (field) {
                        await this.loadGroups(
                            store.search()!,
                            store.searchOperator()!,
                        );
                    }
                },

                async loadGroupBooks(groupValue: string) {
                    if (store.groupBooks()[groupValue] != null) {
                        return;
                    }

                    const bookIds = await bookStore.loadByGroup(
                        store.groupField()!,
                        groupValue,
                    );

                    patchState(store, {
                        groupBooks: {
                            ...store.groupBooks(),
                            [groupValue]: bookIds,
                        },
                    });
                },
            };
        }),

        withHooks({
            onInit(store) {
                const groupByField = localStorage.getItem(
                    ACTIVE_GROUP_FIELD_KEY,
                );

                if (groupByField) {
                    store.setActiveGroupBy(groupByField as keyof Book);
                }
            },
        }),
    );
}
