import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { db } from '../db';
import { Book } from './book';
import { Character } from '../character/character';

class BookCharacter extends Model<
    InferAttributes<BookCharacter>,
    InferCreationAttributes<BookCharacter>
> {
    declare bookId: number;
    declare characterId: number;
}

BookCharacter.init(
    {
        bookId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: Book, key: 'id' },
        },
        characterId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: Character, key: 'id' },
        },
    },
    {
        sequelize: db,
        modelName: 'BookCharacter',
    },
);

export { BookCharacter };
