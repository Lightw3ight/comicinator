import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { parseDate } from '../../helpers/parse-date';
import { db } from '../db';

class Book extends Model<InferAttributes<Book>, InferCreationAttributes<Book>> {
    declare id: number;
    declare dateAdded: Date;
    declare filePath: string;
    declare title: string;
    declare series?: string;
    declare number?: number;
    declare volume?: number;
    declare summary?: string;
    declare notes?: string;
    declare coverDate?: Date;
    declare writer?: string;
    declare penciler?: string;
    declare inker?: string;
    declare colorist?: string;
    declare letterer?: string;
    declare coverArtist?: string;
    declare editor?: string;
    declare publisherId?: number;
    declare pageCount?: number;
    declare fileSize?: number;
    declare externalUrl?: string;
    declare externalId?: number;
    declare lastUpdated?: Date;
}

Book.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        filePath: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        series: DataTypes.TEXT,
        number: DataTypes.INTEGER,
        volume: DataTypes.TEXT,
        summary: DataTypes.TEXT,
        notes: DataTypes.TEXT,
        writer: DataTypes.TEXT,
        penciler: DataTypes.TEXT,
        inker: DataTypes.TEXT,
        colorist: DataTypes.TEXT,
        letterer: DataTypes.TEXT,
        coverArtist: DataTypes.TEXT,
        editor: DataTypes.TEXT,
        publisherId: DataTypes.INTEGER,
        pageCount: DataTypes.INTEGER,
        fileSize: DataTypes.INTEGER,
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
        coverDate: {
            type: DataTypes.DATE,
            get() {
                return parseDate(this.getDataValue('coverDate'));
            },
        },
        externalUrl: DataTypes.TEXT,
        externalId: DataTypes.INTEGER,
    },
    {
        sequelize: db,
        modelName: 'Book',
    },
);

export { Book };
