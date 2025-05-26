import { Op, Transaction } from 'sequelize';
import { Character, CharacterModel } from './character';
import { db } from './db';
import { TeamCharacterModel } from './team-character';

export async function selectCharacterImage(id: number) {
    const item = await CharacterModel.findByPk(id, { attributes: ['image'] });
    return item.dataValues.image;
}

async function assignTeams(
    characterId: number,
    teamIds: number[],
    tx: Transaction,
) {
    await TeamCharacterModel.destroy({
        where: { characterId },
        transaction: tx,
    });

    for (let teamId of teamIds) {
        await TeamCharacterModel.create(
            { characterId, teamId },
            { transaction: tx },
        );
    }
}

export const CHARACTER_CONTROLLER = {
    async selectAll() {
        const results = await CharacterModel.findAll({
            raw: true,
            order: [['name', 'ASC']],
            attributes: { exclude: ['image'] },
        });

        return results;
    },

    async search(query: string, order = 'name', dir = 'ASC') {
        const results = await CharacterModel.findAll({
            raw: true,
            order: [[order, dir]],
            attributes: ['id'],
            where: {
                name: { [Op.like]: `%${query}%` },
            },
        });

        return results;
    },

    async update(id: number, character: Character, teamIds: number[]) {
        const tx = await db.transaction();

        try {
            await CharacterModel.update(
                {
                    ...character,
                    lastUpdated: new Date(),
                    image: character.image
                        ? Buffer.from(character.image)
                        : undefined,
                },
                { where: { id: id }, transaction: tx },
            );

            await assignTeams(id, teamIds, tx);

            await tx.commit();
        } catch (error) {
            tx.rollback();
            throw error;
        }
    },

    async create(character: Omit<Character, 'id'>, teamIds: number[]) {
        const tx = await db.transaction();
        try {
            const newUser = await CharacterModel.create({
                ...character,
                lastUpdated: new Date(),
                image: character.image
                    ? Buffer.from(character.image)
                    : undefined,
            });

            await assignTeams(newUser.dataValues.id, teamIds, tx);

            await tx.commit();
            return newUser.dataValues;
        } catch (error) {
            tx.rollback();
            throw error;
        }
    },

    async remove(id: number) {
        await CharacterModel.destroy({ where: { id: id } });
    },
};
