import { DataTypes, Model } from 'sequelize';
import { db } from './db';

export interface TeamCharacter {
    teamId: number;
    characterId: number;
}

// class CharacterModel extends Model<Character> {}
class TeamCharacterModel extends Model<TeamCharacter> {}

TeamCharacterModel.init(
    {
        teamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        characterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        modelName: 'TeamCharacter',
    },
);

export { TeamCharacterModel };
