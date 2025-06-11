import { Book } from '../../../core/models/book.interface';
import { Character } from '../../../core/models/character.interface';
import { Team } from '../../../core/models/team.interface';

export interface CharacterDetailsState {
    character: Character | undefined;
    books: Book[];
    teams: Team[];
}

export const CHARACTER_DETAILS_INITIAL_STATE: CharacterDetailsState = {
    character: undefined,
    books: [],
    teams: [],
};
