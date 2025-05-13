import { Dictionary } from '../../models/dictionary.interface';

export interface CharactersState {
    loaded: boolean;
    names: Dictionary<number>;
    currentSearch: string;
    searchIds: number[];
}

export const CHARACTERS_INITIAL_STATE: CharactersState = {
    loaded: false,
    names: {},
    currentSearch: '',
    searchIds: [],
};
