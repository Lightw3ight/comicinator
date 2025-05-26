import { Dictionary } from '../../models/dictionary.interface';

export interface TeamsState {
    loaded: boolean;
    names: Dictionary<number>;
    activeSearch: { query: string | undefined; results: number[] };
    activeTeam: {
        teamId: number | undefined;
        characterIds: number[];
        bookIds: number[];
    };
}

export const TEAMS_INITIAL_STATE: TeamsState = {
    loaded: false,
    names: {},
    activeSearch: { query: undefined, results: [] },
    activeTeam: { characterIds: [], bookIds: [], teamId: undefined },
};
