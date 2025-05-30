import { Character } from '../../models/character.interface';
import { EntityBaseState } from '../entity-base-state.interface';

export interface CharactersState extends EntityBaseState<Character, number> {}

export const CHARACTERS_INITIAL_STATE: CharactersState = {
    sortField: 'name',
    sortDirection: 'ASC',
    searchText: undefined,
    pagesLoaded: {},
    pagedData: [],
    itemCount: 0,
    columnCount: 0,
};
