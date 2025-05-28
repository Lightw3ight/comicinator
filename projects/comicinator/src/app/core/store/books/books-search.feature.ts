import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { BooksApiService } from '../../api/books/books-api.service';
import { BooksState } from './books-state.interface';
import { addEntities, EntityState } from '@ngrx/signals/entities';
import { Book } from '../../models/book.interface';

export function withBooksSearchFeature() {
    return signalStoreFeature(
        { state: type<BooksState & EntityState<Book>>() },

        withMethods((store) => {
            const booksApiService = inject(BooksApiService);

            return {
                async searchByCharacter(charId: number) {
                    const books =
                        await booksApiService.selectByCharacter(charId);
                    patchState(store, addEntities(books));
                    return books;
                },

                async searchByTeam(charId: number) {
                    const books = await booksApiService.selectByTeam(charId);
                    patchState(store, addEntities(books));
                    return books;
                },

                async search(query: string) {
                    const books = await booksApiService.search(query);

                    patchState(store, addEntities(books), {
                        searchText: query,
                        activeDisplayIds: books.map((o) => o.id),
                    });
                },

                clearSearch() {
                    patchState(store, {
                        searchText: undefined,
                        activeDisplayIds: [],
                    });
                },
            };
        }),
    );
}
