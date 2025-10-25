import { Book } from './book/book';
import { BookCharacter } from './book/book-character';
import { BookLocation } from './book/book-location';
import { BookTeam } from './book/book-team';
import { Character } from './character/character';
import { Location } from './location/location';
import { Team } from './team/team';
import { TeamCharacter } from './team/team-character';
import { db } from './db';
import { Library } from './library/library';
import { LibraryFilter } from './library/library-filter';
import { userDb } from './user-db';
import { USER_DATA_PATH } from '../app-paths';

export async function initializeModelRelationships() {
    Book.belongsToMany(Character, {
        through: BookCharacter,
        foreignKey: 'bookId',
    });
    Book.belongsToMany(Location, {
        through: BookLocation,
        foreignKey: 'bookId',
    });
    Book.belongsToMany(Team, {
        through: BookTeam,
        foreignKey: 'bookId',
    });

    Character.belongsToMany(Book, {
        through: BookCharacter,
        foreignKey: 'characterId',
    });
    Character.belongsToMany(Team, {
        through: TeamCharacter,
        foreignKey: 'characterId',
    });

    Team.belongsToMany(Book, {
        through: BookTeam,
        foreignKey: 'teamId',
    });
    Team.belongsToMany(Character, {
        through: TeamCharacter,
        foreignKey: 'teamId',
    });

    Location.belongsToMany(Book, {
        through: BookLocation,
        foreignKey: 'locationId',
    });

    LibraryFilter.belongsTo(Library, { foreignKey: 'libraryId' });

    await db.sync();
    await userDb.sync();
}
