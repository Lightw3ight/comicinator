import { Dictionary } from '../../models/dictionary.interface';
import { LoadState } from '../../models/load-state.enum';

export interface BooksState {
    loadState: LoadState;

    searchText: string | undefined;
    quickSearch: string;
    quickSearchResultCache: Dictionary<number[]>;

    activeDisplayIds: number[];
}

export const BOOKS_INITIAL_STATE: BooksState = {
    loadState: LoadState.Initial,
    searchText: undefined,
    quickSearch: 'a',
    quickSearchResultCache: {},
    activeDisplayIds: [],
};
