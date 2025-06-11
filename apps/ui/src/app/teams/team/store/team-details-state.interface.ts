import { Book } from '../../../core/models/book.interface';
import { Character } from '../../../core/models/character.interface';
import { Team } from '../../../core/models/team.interface';

export interface TeamDetailsState {
    team: Team | undefined;
    books: Book[];
    characters: Character[];
}

export const TEAM_DETAILS_INITIAL_STATE: TeamDetailsState = {
    team: undefined,
    books: [],
    characters: [],
};
