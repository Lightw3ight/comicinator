import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { BooksApiService } from '../../api/books/books-api.service';
import { BooksState } from './books-state.interface';

export function withBooksSearchFeature() {
    return signalStoreFeature(
        { state: type<BooksState>() },

        withMethods((store) => {
            const booksApiService = inject(BooksApiService);

            return {
                async searchByCharacter(charId: number) {
                    const ids = await booksApiService.searchByCharacter(charId);
                    patchState(store, { searchResultIds: ids });
                },

                async searchByTeam(teamId: number) {
                    const ids = await booksApiService.searchByTeam(teamId);
                    patchState(store, { searchResultIds: ids });
                },
            };
        })
    );
}
