import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { addEntities, addEntity, EntityState } from '@ngrx/signals/entities';
import { BooksApiService } from '../../api/books/books-api.service';
import { Book } from '../../models/book.interface';
import { BooksState } from './books-state.interface';

export function withBooksSearchFeature() {
    return signalStoreFeature(
        { state: type<BooksState & EntityState<Book>>() },

        withMethods((store) => {
            const booksApiService = inject(BooksApiService);

            return {
                async searchNextInSeries(book: Book) {
                    const nextBook = await booksApiService.selectNextInSeries(
                        book.publisherId,
                        book.series!,
                        book.volume,
                        book.number!,
                    );

                    if (nextBook) {
                        patchState(store, addEntity(nextBook));
                    }

                    return nextBook;
                },

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
            };
        }),
    );
}
