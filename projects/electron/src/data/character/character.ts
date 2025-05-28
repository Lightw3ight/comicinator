import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { parseDate } from '../../helpers/parse-date';
import { db } from '../db';

class Character extends Model<
    InferAttributes<Character>,
    InferCreationAttributes<Character>
> {
    declare id: number;
    declare name: string;
    declare aliases?: string;
    declare creators?: string;
    declare summary?: string;
    declare description?: string;
    declare gender?: number;
    declare origin?: string;
    declare powers?: string;
    declare publisherId?: number;
    declare realName?: string;
    declare birthDate?: Date;
    declare lastUpdated?: Date;
    declare dateAdded: Date;
    declare image?: Buffer;
    declare externalUrl?: string;
    declare externalId?: number;
}

Character.init(
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
        aliases: DataTypes.TEXT,
        creators: DataTypes.TEXT,
        summary: DataTypes.TEXT,
        description: DataTypes.TEXT,
        gender: DataTypes.TEXT,
        origin: DataTypes.TEXT,
        powers: DataTypes.TEXT,
        publisherId: DataTypes.TEXT,
        realName: DataTypes.TEXT,
        birthDate: {
            type: DataTypes.DATE,
            get() {
                return parseDate(this.getDataValue('birthDate'));
            },
        },
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
        modelName: 'Character',
    },
);

export { Character };
