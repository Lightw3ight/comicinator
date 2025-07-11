import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { parseDate } from '../../helpers/parse-date';
import { db } from '../db';

class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
    declare id: number;
    declare name: string;
    declare aliases?: string;
    declare description?: string;
    declare publisherId?: number;
    declare lastUpdated?: Date;
    declare dateAdded: Date;
    declare image?: Buffer;
    declare externalUrl?: string;
    declare externalId?: number;
}

Team.init(
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
        aliases: DataTypes.TEXT,
        description: DataTypes.TEXT,
        publisherId: DataTypes.TEXT,
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
        modelName: 'Team',
        indexes: [
            {
                fields: ['externalId'],
            },
        ],
    },
);

export { Team };
