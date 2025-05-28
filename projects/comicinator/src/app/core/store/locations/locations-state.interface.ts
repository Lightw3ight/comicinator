import { Dictionary } from '../../models/dictionary.interface';
import { LoadState } from '../../models/load-state.enum';

export interface LocationsState {
    loadState: LoadState;

    search: string | undefined;
    quickSearch: string;
    quickSearchResultCache: Dictionary<number[]>;

    activeDisplayIds: number[];
}

export const LOCATIONS_INITIAL_STATE: LocationsState = {
    loadState: LoadState.Initial,
    search: undefined,
    quickSearch: 'a',
    quickSearchResultCache: {},
    activeDisplayIds: [],
};
