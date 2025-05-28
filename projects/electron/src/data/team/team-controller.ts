import { Op, Transaction } from 'sequelize';
import { Book } from '../book/book';
import { Character } from '../character/character';
import { db } from '../db';
import { Team } from './team';
import { TeamCharacter } from './team-character';

async function assignCharacters(
    teamId: number,
    characterIds: number[],
    tx: Transaction,
) {
    await TeamCharacter.destroy({
        where: { teamId },
        transaction: tx,
    });

    for (let characterId of characterIds) {
        await TeamCharacter.create(
            { characterId, teamId },
            { transaction: tx },
        );
    }
}

export class TeamController {
    public static async selectById(id: number) {
        const model = await Team.findByPk(id, {
            plain: true,
            attributes: { exclude: ['image'] },
        });
        return model.get({ plain: true });
    }

    public static async selectByIds(ids: number[]) {
        const results = await Team.findAll({
            where: { id: ids },
            order: [['name', 'ASC']],
        });
        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectAll() {
        const results = await Team.findAll({
            order: [['name', 'ASC']],
            attributes: { exclude: ['image'] },
        });

        return results.map((r) => r.get({ plain: true }));
    }

    public static async search(query: string, order = 'name', dir = 'ASC') {
        const results = await Team.findAll({
            order: [[order, dir]],
            where: {
                name: { [Op.like]: `%${query}%` },
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async findForImport(externalId: number | null, name: string) {
        let where: any[] = [
            {
                externalId: externalId,
            },
        ];

        if (externalId != null) {
            where = [
                {
                    externalId: externalId,
                },
                {
                    name: { [Op.like]: name },
                    externalId: null,
                },
            ];
        }

        const result = await Team.findOne({
            where: {
                [Op.or]: where,
            },
        });
        return result?.get({ plain: true });
    }

    public static async startsWith(
        query: string,
        order = 'name',
        dir = 'ASC',
    ): Promise<{ id: number }[]> {
        const results = await Team.findAll({
            order: [[order, dir]],
            where: {
                name: { [Op.startsWith]: query },
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectImage(
        id: number,
    ): Promise<Buffer<ArrayBufferLike>> {
        const item = await Team.findByPk(id, {
            attributes: ['image'],
        });
        return item.dataValues.image;
    }

    public static async selectByBook(
        bookId: number,
        order = 'name',
        orderDirection = 'ASC',
    ) {
        const results = await Team.findAll({
            order: [[order, orderDirection]],
            include: {
                model: Book,
                where: { id: bookId },
                attributes: [],
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectByCharacter(
        characterId: number,
        order = 'name',
        orderDirection = 'ASC',
    ) {
        const results = await Team.findAll({
            order: [[order, orderDirection]],
            include: {
                model: Character,
                where: { id: characterId },
                attributes: [],
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async create(
        team: Omit<Team, 'id'>,
        image: Uint8Array | undefined,
        characterIds: number[],
    ) {
        const tx = await db.transaction();

        const modelToSave: Partial<Team> = {
            ...team,
            lastUpdated: new Date(),
            dateAdded: new Date(),
        };

        if (image) {
            modelToSave.image = Buffer.from(image);
        }

        try {
            const newUser = await Team.create(modelToSave);

            await assignCharacters(newUser.dataValues.id, characterIds, tx);

            await tx.commit();
            return newUser.dataValues;
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }

    public static async remove(id: number) {
        await Team.destroy({ where: { id: id } });
    }

    public static async update(
        id: number,
        team: Partial<Team>,
        image: Uint8Array | undefined,
        characterIds: number[],
    ) {
        const tx = await db.transaction();

        const modelToSave: Partial<Team> = {
            ...team,
            lastUpdated: new Date(),
        };

        if (image) {
            modelToSave.image = Buffer.from(image);
        }

        try {
            await Team.update(modelToSave, {
                where: { id: id },
                transaction: tx,
            });

            await assignCharacters(id, characterIds, tx);

            await tx.commit();
        } catch (error) {
            await tx.rollback();
            throw error;
        }

        return await this.selectById(id);
    }
}
