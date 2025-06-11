import { signalStore, withState } from '@ngrx/signals';
import { withBookGroupCoreFeature } from './book-group-core.feature';
import { BOOK_GROUP_INITIAL_STATE } from './book-group-state.interface';

export const BookGroupStore = signalStore(
    { providedIn: 'root' },
    withState(BOOK_GROUP_INITIAL_STATE),
    withBookGroupCoreFeature(),
);
