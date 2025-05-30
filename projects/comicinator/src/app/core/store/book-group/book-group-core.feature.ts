import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import { BooksApiService } from '../../api/books/books-api.service';
import { BookGroup } from '../../models/book-group.interface';
import { Book } from '../../models/book.interface';
import { PAGE_SCROLL_SIZE } from '../../models/page-scroll-size.const';
import { BooksStore } from '../books/books.store';
import { chunkItems } from '../chunk-items';
import { BookGroupState } from './book-group-state.interface';

import { addEntities, withEntities } from '@ngrx/signals/entities';

const ACTIVE_GROUP_FIELD_KEY = 'cbx-book-group';

export function withBookGroupCoreFeature() {
    return signalStoreFeature(
        { state: type<BookGroupState>() },

        withEntities<BookGroup>(),

        withMethods((store) => {
            const bookApiService = inject(BooksApiService);
            const bookStore = inject(BooksStore);

            return {
                setActiveGroupField(field: keyof Book) {
                    patchState(store, {
                        groupField: field,
                        activeGroup: undefined,
                        activeGroupBooks: [],
                    });
                    localStorage.setItem(ACTIVE_GROUP_FIELD_KEY, field);
                },

                clearActiveGroupField() {
                    localStorage.removeItem(ACTIVE_GROUP_FIELD_KEY);
                    patchState(store, {
                        groupField: undefined,
                        activeGroup: undefined,
                        activeGroupBooks: [],
                    });
                },

                async setActiveGroup(field: keyof Book, groupValue: string) {
                    await this.setActiveGroupField(field);
                    const ids = await bookStore.loadByGroup(
                        store.groupField()!,
                        groupValue,
                    );

                    patchState(store, {
                        activeGroup: groupValue,
                        activeGroupBooks: ids,
                    });
                },

                setColumnCount(count: number) {
                    if (count !== store.columnCount()) {
                        patchState(store, { columnCount: count });
                    }
                },

                async resetPageData() {
                    const field = store.groupField();

                    if (field == null) {
                        return;
                    }

                    const columnCount = store.columnCount();
                    const itemCount = await bookApiService.selectGroupedTotal(
                        field,
                        store.searchText(),
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
                        const pagedData = Array.from<string[]>({
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
                    const field = store.groupField();

                    if (field == null || store.pagesLoaded()[pageIndex]) {
                        return;
                    }

                    patchState(store, {
                        pagesLoaded: {
                            ...store.pagesLoaded(),
                            [pageIndex]: true,
                        },
                    });

                    const offset = pageIndex * PAGE_SCROLL_SIZE;
                    const books = await bookApiService.selectGrouped(
                        field,
                        store.searchText(),
                        offset,
                        PAGE_SCROLL_SIZE * store.columnCount(),
                        bookStore.sortField(),
                        bookStore.sortDirection(),
                    );
                    const ids = books.map((o) => o.id);
                    const chunkedIds = chunkItems(ids, store.columnCount());
                    const pagedData = [...store.pagedData()];
                    pagedData.splice(
                        pageIndex * PAGE_SCROLL_SIZE,
                        PAGE_SCROLL_SIZE,
                        ...chunkedIds,
                    );
                    patchState(store, addEntities(books), { pagedData });
                },

                // selectGroupBooks(groupValue: string) {
                //     return computed(() => {
                //         return store.groupBooks()[groupValue];
                //     });
                // },

                // setActiveGroupBy(field: keyof Book) {
                //     let groupBooks = { ...store.groupBooks() };

                //     if (field !== store.groupField()) {
                //         groupBooks = {};
                //     }

                //     patchState(store, {
                //         groupField: field,
                //         search: store.search() ?? 'a',
                //         searchOperator: store.searchOperator() ?? 'starts-with',
                //         groups: [],
                //         groupBooks,
                //     });
                // },

                // clearGrouping() {
                //     patchState(store, {
                //         groupField: undefined,
                //         groups: [],
                //         groupBooks: {},
                //     });

                //     localStorage.removeItem(ACTIVE_GROUP_FIELD_KEY);
                // },

                // async loadGroups(filter: string, operator: FilterOperator) {
                //     const groups = await bookApiService.groupBy(
                //         store.groupField()!,
                //         filter,
                //         operator === 'contains',
                //     );

                //     patchState(store, {
                //         groups,
                //         search: filter,
                //         searchOperator: operator,
                //     });
                // },

                // async reloadGroups() {
                //     const field = store.groupField();
                //     if (field) {
                //         await this.loadGroups(
                //             store.search()!,
                //             store.searchOperator()!,
                //         );
                //     }
                // },

                // async loadGroupBooks(groupValue: string) {
                //     if (store.groupBooks()[groupValue] != null) {
                //         return;
                //     }

                //     const bookIds = await bookStore.loadByGroup(
                //         store.groupField()!,
                //         groupValue,
                //     );

                //     patchState(store, {
                //         groupBooks: {
                //             ...store.groupBooks(),
                //             [groupValue]: bookIds,
                //         },
                //     });
                // },
            };
        }),

        withHooks({
            onInit(store) {
                const groupByField = localStorage.getItem(
                    ACTIVE_GROUP_FIELD_KEY,
                );

                if (groupByField) {
                    store.setActiveGroupField(groupByField as keyof Book);
                }
            },
        }),
    );
}
