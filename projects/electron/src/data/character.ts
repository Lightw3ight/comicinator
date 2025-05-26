import { DataTypes, Model } from 'sequelize';
import { db } from './db';

export interface Character {
    id: number;
    name: string;
    aliases?: string;
    creators?: string;
    summary?: string;
    description?: string;
    gender?: number;
    origin?: string;
    powers?: string;
    publisherId?: number;
    realName?: string;
    birthDate?: Date;
    lastUpdated?: Date;
    dateAdded: Date;
    image?: Buffer;
    externalUrl?: string;
    externalId?: number;
}

// class CharacterModel extends Model<Character> {}
class CharacterModel extends Model<Character> {}

CharacterModel.init(
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
        birthDate: DataTypes.DATE,
        dateAdded: DataTypes.DATE,
        lastUpdated: DataTypes.DATE,
        image: DataTypes.BLOB,
        externalUrl: DataTypes.TEXT,
        externalId: DataTypes.INTEGER,
    },
    {
        sequelize: db,
        modelName: 'Character',
    },
);

export { CharacterModel };
