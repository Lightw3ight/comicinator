import { Dictionary } from '../../models/dictionary.interface';

export interface CharactersState {
    loaded: boolean;
    names: Dictionary<number>;
    activeCharacter: {
        teamIds: number[];
        bookIds: number[];
        characterId: number | undefined;
    };
    activeSearch: { query: string | undefined; results: number[] };
}

export const CHARACTERS_INITIAL_STATE: CharactersState = {
    loaded: false,
    names: {},
    activeCharacter: { teamIds: [], bookIds: [], characterId: undefined },
    activeSearch: { query: undefined, results: [] },
};
