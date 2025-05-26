import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { BooksApiService } from '../../api/books/books-api.service';
import { BooksState } from './books-state.interface';
import { EntityState } from '@ngrx/signals/entities';
import { Book } from '../../models/book.interface';

export function withBooksSearchFeature() {
    return signalStoreFeature(
        { state: type<BooksState & EntityState<Book>>() },

        withMethods((store) => {
            const booksApiService = inject(BooksApiService);

            return {
                async searchByCharacter(charId: number) {
                    const ids = await booksApiService.searchByCharacter(charId);
                    patchState(store, { searchResultIds: ids });
                },

                async search(query: string) {
                    const ids = await booksApiService.search(query);

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
