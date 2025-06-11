import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { parseDate } from '../../helpers/parse-date';
import { db } from '../db';

class Publisher extends Model<
    InferAttributes<Publisher>,
    InferCreationAttributes<Publisher>
> {
    declare id: number;
    declare name: string;
    declare description?: string;
    declare image?: Buffer;
    declare externalUrl?: string;
    declare externalId?: number;
    declare dateAdded: Date;
    declare lastUpdated?: Date;
}

Publisher.init(
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
        image: DataTypes.BLOB,
        externalUrl: DataTypes.TEXT,
        externalId: DataTypes.INTEGER,
    },
    {
        sequelize: db,
        modelName: 'Publisher',
    },
);

export { Publisher };
