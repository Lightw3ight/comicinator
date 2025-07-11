import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { parseDate } from '../../helpers/parse-date';
import { db } from '../db';

class Library extends Model<
    InferAttributes<Library>,
    InferCreationAttributes<Library>
> {
    declare id: number;
    declare name: string;
    declare description?: string;
    declare lastUpdated: Date;
    declare dateAdded: Date;
    declare matchAll: boolean;
    declare showInQuickList: boolean;
}

Library.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: DataTypes.TEXT,
        dateAdded: {
            type: DataTypes.DATE,
            allowNull: false,
            get() {
                return parseDate(this.getDataValue('dateAdded'));
            },
        },
        lastUpdated: {
            type: DataTypes.DATE,
            get() {
                return parseDate(this.getDataValue('lastUpdated'));
            },
        },
        matchAll: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        showInQuickList: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        modelName: 'Library',
    },
);

export { Library };
