import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { parseDate } from '../../helpers/parse-date';
import { userDb } from '../user-db';

class UserBookState extends Model<
    InferAttributes<UserBookState>,
    InferCreationAttributes<UserBookState>
> {
    declare bookId: number;
    declare lastOpened: Date;
    declare currentPage: number;
    declare complete: boolean;
}

UserBookState.init(
    {
        bookId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        complete: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        currentPage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        lastOpened: {
            type: DataTypes.DATE,
            get() {
                return parseDate(this.getDataValue('lastOpened'));
            },
        },
    },
    {
        sequelize: userDb,
        modelName: 'UserBookState',
    },
);

export { UserBookState };
