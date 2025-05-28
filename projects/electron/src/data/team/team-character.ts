import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { db } from '../db';
import { Team } from './team';
import { Character } from '../character/character';

class TeamCharacter extends Model<
    InferAttributes<TeamCharacter>,
    InferCreationAttributes<TeamCharacter>
> {
    declare teamId: number;
    declare characterId: number;
}

TeamCharacter.init(
    {
        teamId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: Team, key: 'id' },
        },
        characterId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: Character, key: 'id' },
        },
    },
    {
        sequelize: db,
        modelName: 'TeamCharacter',
    },
);

export { TeamCharacter };
