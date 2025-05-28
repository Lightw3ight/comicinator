import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { db } from '../db';

class Setting extends Model<
    InferAttributes<Setting>,
    InferCreationAttributes<Setting>
> {
    declare key: string;
    declare value: string;
}

Setting.init(
    {
        key: {
            type: DataTypes.TEXT,
            primaryKey: true,
        },
        value: DataTypes.TEXT,
    },
    {
        sequelize: db,
        modelName: 'Settings',
    },
);

export { Setting };
