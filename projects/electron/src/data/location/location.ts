import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { parseDate } from '../../helpers/parse-date';
import { db } from '../db';

class Location extends Model<
    InferAttributes<Location>,
    InferCreationAttributes<Location>
> {
    declare id: number;
    declare name: string;
    declare description?: string;
    declare lastUpdated?: Date;
    declare dateAdded: Date;
    declare image?: Buffer;
    declare externalUrl?: string;
    declare externalId?: number;
}

Location.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: DataTypes.TEXT,
        dateAdded: {
            type: DataTypes.DATE,
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
        modelName: 'Location',
    },
);

export { Location };
