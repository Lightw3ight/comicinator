import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { BooksApiService } from '../../api/books/books-api.service';
import { Book } from '../../models/book.interface';
import { BooksState } from './books-state.interface';

export function withBooksSearchFeature() {
    return signalStoreFeature(
        { state: type<BooksState>() },

        withEntities<Book>(),

        withMethods((store) => {
            const booksApiService = inject(BooksApiService);

            return {
                async searchByCharacter(charId: number) {
                    const ids = await booksApiService.searchByCharacter(charId);
                    patchState(store, { searchResultIds: ids });
                },
            };
        })
    );
}
