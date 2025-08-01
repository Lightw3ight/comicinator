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
    declare number?: string;
    declare volume?: number;
    declare summary?: string;
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
    declare currentPage?: number;
    declare fileSize?: number;
    declare externalUrl?: string;
    declare externalId?: number;
    declare lastUpdated?: Date;
    declare lastOpened?: Date;
    declare frontCover?: string;
}

Book.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        filePath: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        series: DataTypes.TEXT,
        number: DataTypes.TEXT,
        volume: DataTypes.TEXT,
        summary: DataTypes.TEXT,
        writer: DataTypes.TEXT,
        penciler: DataTypes.TEXT,
        inker: DataTypes.TEXT,
        colorist: DataTypes.TEXT,
        letterer: DataTypes.TEXT,
        coverArtist: DataTypes.TEXT,
        editor: DataTypes.TEXT,
        frontCover: DataTypes.TEXT,
        publisherId: DataTypes.INTEGER,
        pageCount: DataTypes.INTEGER,
        currentPage: DataTypes.INTEGER,
        fileSize: DataTypes.INTEGER,
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
        coverDate: {
            type: DataTypes.DATE,
            get() {
                return parseDate(this.getDataValue('coverDate'));
            },
        },
        lastOpened: {
            type: DataTypes.DATE,
            get() {
                return parseDate(this.getDataValue('lastOpened'));
            },
        },
        externalUrl: DataTypes.TEXT,
        externalId: DataTypes.INTEGER,
    },
    {
        sequelize: db,
        modelName: 'Book',
        indexes: [
            {
                fields: ['externalId'],
                unique: true,
            },
            {
                fields: ['dateAdded'],
            },
            {
                fields: ['lastUpdated'],
            },
            {
                fields: ['series'],
            },
        ],
    },
);

export { Book };
