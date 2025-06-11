import { signalStore, withState } from '@ngrx/signals';
import { withBooksCoreFeature } from './books-core.feature';
import { withBooksSearchFeature } from './books-search.feature';
import { BOOKS_INITIAL_STATE } from './books-state.interface';

export const BooksStore = signalStore(
    { providedIn: 'root' },
    withState(BOOKS_INITIAL_STATE),
    withBooksCoreFeature(),
    withBooksSearchFeature(),
);
