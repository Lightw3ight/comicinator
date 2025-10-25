import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withComputed,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import { EntityState } from '@ngrx/signals/entities';
import { FollowSeriesApiService } from '../../api/follow-series/follow-series-api.service';
import { UserBookStateApiService } from '../../api/user-book-state/user-book-state-api.service';
import { Book } from '../../models/book.interface';
import { UserBookState } from '../../models/user-book-state.interface';
import { BooksState } from './books-state.interface';

import { updateEntity } from '@ngrx/signals/entities';
import { BooksApiService } from '../../api/books/books-api.service';

export function withBooksFollowedSeriesFeature() {
    return signalStoreFeature(
        { state: type<BooksState & EntityState<Book>>() },

        withComputed((store) => {
            const userBookStateMap = computed(() => {
                const state = store.userBookState();

                return state.reduce(
                    (acc, item) => {
                        acc[item.bookId] = item;
                        return acc;
                    },
                    {} as {
                        [bookId: number]: UserBookState;
                    },
                );
            });

            return {
                userBookStateMap,
            };
        }),

        withMethods((store) => {
            const followSeriesApiService = inject(FollowSeriesApiService);
            const userBookStateApiService = inject(UserBookStateApiService);
            const booksApiService = inject(BooksApiService);

            return {
                async loadFollowedSeries() {
                    const visible =
                        await followSeriesApiService.selectSeriesWithUnreadBooks();
                    const all = await followSeriesApiService.selectAll();

                    visible.sort();

                    patchState(store, {
                        allFollowedSeries: all,
                        visibleFollowedSeries: visible,
                    });
                },

                async followSeries(seriesName: string) {
                    await followSeriesApiService.followSeries(seriesName);
                    await this.loadFollowedSeries();
                },

                async unfollowSeries(seriesName: string) {
                    await followSeriesApiService.unfollowSeries(seriesName);
                    await this.loadFollowedSeries();
                },

                async setBookState(
                    bookId: number,
                    state: Partial<Omit<UserBookState, 'bookId'>>,
                ) {
                    await userBookStateApiService.setBookState(bookId, state);
                    await this.loadBookState(bookId);
                    this.loadFollowedSeries();
                },

                async markComplete(book: Book, complete: boolean) {
                    this.setBookState(book.id, { complete });
                },

                async loadBookState(bookId: number) {
                    const state =
                        await userBookStateApiService.selectById(bookId);
                    if (state) {
                        const existing = store.userBookStateMap()[bookId];

                        if (existing) {
                            patchState(store, {
                                userBookState: [
                                    ...store
                                        .userBookState()
                                        .filter((o) => o.bookId !== bookId),
                                    state,
                                ],
                            });
                        } else {
                            patchState(store, {
                                userBookState: [
                                    ...store.userBookState(),
                                    state,
                                ],
                            });
                        }
                    }
                },

                async setReadDetails(
                    id: number,
                    currentPage: number,
                    pageCount: number,
                ) {
                    await booksApiService.setReadDetails(
                        id,
                        currentPage,
                        pageCount,
                    );

                    patchState(
                        store,
                        updateEntity({ id, changes: { pageCount } }),
                    );

                    await this.loadBookState(id);
                },
            };
        }),

        withHooks((store) => {
            return {
                onInit() {
                    store.loadFollowedSeries();
                },
            };
        }),
    );
}
