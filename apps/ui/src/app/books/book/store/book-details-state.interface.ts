import { Book } from '../../../core/models/book.interface';
import { Character } from '../../../core/models/character.interface';
import { Location } from '../../../core/models/location.interface';
import { Team } from '../../../core/models/team.interface';

export interface BookDetailsState {
    book: Book | undefined;
    characters: Character[];
    teams: Team[];
    locations: Location[];
}

export const BOOK_DETAILS_INITIAL_STATE: BookDetailsState = {
    book: undefined,
    characters: [],
    teams: [],
    locations: [],
};
