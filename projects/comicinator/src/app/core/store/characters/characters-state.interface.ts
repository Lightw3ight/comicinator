import { Dictionary } from '../../models/dictionary.interface';
import { LoadState } from '../../models/load-state.enum';

export interface CharactersState {
    loadState: LoadState;

    search: string | undefined;
    quickSearch: string;
    quickSearchResultCache: Dictionary<number[]>;

    activeDisplayIds: number[];
}

export const CHARACTERS_INITIAL_STATE: CharactersState = {
    loadState: LoadState.Initial,
    search: undefined,
    quickSearch: 'a',
    quickSearchResultCache: {},
    activeDisplayIds: [],
};
