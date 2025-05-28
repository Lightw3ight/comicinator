import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { db } from '../db';
import { Book } from './book';
import { Team } from '../team/team';

class BookTeam extends Model<
    InferAttributes<BookTeam>,
    InferCreationAttributes<BookTeam>
> {
    declare bookId: number;
    declare teamId: number;
}

BookTeam.init(
    {
        bookId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: Book, key: 'id' },
        },
        teamId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: Team, key: 'id' },
        },
    },
    {
        sequelize: db,
        modelName: 'BookTeam',
    },
);

export { BookTeam };
