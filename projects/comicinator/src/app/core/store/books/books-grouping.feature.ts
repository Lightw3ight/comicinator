import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withComputed,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import { BooksApiService } from '../../api/books/books-api.service';
import { BooksState } from './books-state.interface';
import { EntityState } from '@ngrx/signals/entities';
import { Book } from '../../models/book.interface';

const ACTIVE_GROUP_FIELD_KEY = 'cbx-book-group';

export function withBooksGroupingFeature() {
    return signalStoreFeature(
        { state: type<BooksState & EntityState<Book>>() },

        withComputed((store) => ({
            groupedBooks: computed(() => {
                const ids = store.activeGroupedBookIds();
                return ids.map((id) => store.entityMap()[id]);
            }),
        })),

        withMethods((store) => {
            const booksApiService = inject(BooksApiService);

            return {
                async loadGroupedBooks(groupField: string, value: string) {
                    const ids = await booksApiService.getIdsByGroup(
                        groupField,
                        value,
                    );
                    patchState(store, { activeGroupedBookIds: ids });
                },

                setActiveGroupBy(field: string | undefined) {
                    patchState(store, {
                        activeGroupField: field,
                        activeGroups: [],
                        activeGroupedBookIds: [],
                    });
                    localStorage.setItem(ACTIVE_GROUP_FIELD_KEY, field ?? '');
                },

                async loadGroups() {
                    const field = store.activeGroupField() as keyof Book;

                    if (field == null) {
                        patchState(store, {
                            activeGroupField: field,
                            activeGroups: [],
                            activeGroupedBookIds: [],
                        });
                    } else {
                        const groupData =
                            await booksApiService.loadGroupData(field);
                        patchState(store, {
                            activeGroupField: field,
                            activeGroups: groupData,
                            activeGroupedBookIds: [],
                        });
                    }
                },
            };
        }),

        withHooks({
            onInit(store) {
                const groupByField = localStorage.getItem(
                    ACTIVE_GROUP_FIELD_KEY,
                );

                if (groupByField) {
                    store.setActiveGroupBy(groupByField);
                }
            },
        }),
    );
}
