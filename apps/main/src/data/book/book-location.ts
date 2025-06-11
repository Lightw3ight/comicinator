import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { db } from '../db';
import { Book } from './book';
import { Location } from '../location/location';

class BookLocation extends Model<
    InferAttributes<BookLocation>,
    InferCreationAttributes<BookLocation>
> {
    declare bookId: number;
    declare locationId: number;
}

BookLocation.init(
    {
        bookId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: Book, key: 'id' },
        },
        locationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: Location, key: 'id' },
        },
    },
    {
        sequelize: db,
        modelName: 'BookLocation',
    },
);

export { BookLocation };
