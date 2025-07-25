import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { db } from '../db';
import { Library } from './library';
import { FilterOperator } from '../models/filter-operator.type';

class LibraryFilter extends Model<
    InferAttributes<LibraryFilter>,
    InferCreationAttributes<LibraryFilter>
> {
    declare id: number;
    declare libraryId: number;
    declare field: string;
    declare operator: FilterOperator;
    declare value: string;
}

LibraryFilter.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        libraryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Library, key: 'id' },
            onDelete: 'CASCADE',
        },
        field: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        operator: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        modelName: 'LibraryFilter',
    },
);

export { LibraryFilter };
