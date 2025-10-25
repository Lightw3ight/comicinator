import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { userDb } from '../user-db';

class FollowSeries extends Model<
    InferAttributes<FollowSeries>,
    InferCreationAttributes<FollowSeries>
> {
    declare seriesName: string;
}

FollowSeries.init(
    {
        seriesName: {
            type: DataTypes.TEXT,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize: userDb,
        modelName: 'FollowSeries',
    },
);

export { FollowSeries };
