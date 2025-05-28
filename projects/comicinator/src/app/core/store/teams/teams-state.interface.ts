import { Dictionary } from '../../models/dictionary.interface';
import { LoadState } from '../../models/load-state.enum';

export interface TeamsState {
    loadState: LoadState;

    search: string | undefined;
    quickSearch: string;
    quickSearchResultCache: Dictionary<number[]>;

    activeDisplayIds: number[];
}

export const TEAMS_INITIAL_STATE: TeamsState = {
    loadState: LoadState.Initial,
    search: undefined,
    quickSearch: 'a',
    quickSearchResultCache: {},
    activeDisplayIds: [],
};
