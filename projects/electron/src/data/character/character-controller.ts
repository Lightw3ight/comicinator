import { Op, Transaction } from 'sequelize';
import { BookCharacter } from '../book/book-character';
import { db } from '../db';
import { TeamCharacter } from '../team/team-character';
import { Character } from './character';
import { Book } from '../book/book';
import { Team } from '../team/team';

async function assignTeams(
    characterId: number,
    teamIds: number[],
    tx: Transaction,
) {
    await TeamCharacter.destroy({
        where: { characterId },
        transaction: tx,
    });

    for (let teamId of teamIds) {
        await TeamCharacter.create(
            { characterId, teamId },
            { transaction: tx },
        );
    }
}

export class CharacterController {
    public static async selectById(id: number) {
        const model = await Character.findByPk(id, {
            attributes: { exclude: ['image'] },
        });
        return model.get({ plain: true });
    }

    public static async selectByIds(ids: number[]) {
        const results = await Character.findAll({
            where: { id: ids },
            order: [['name', 'ASC']],
        });
        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectAll() {
        const results = await Character.findAll({
            order: [['name', 'ASC']],
            attributes: { exclude: ['image'] },
        });

        return results.map((r) => r.get({ plain: true }));
    }

    public static async search(query: string, order = 'name', dir = 'ASC') {
        const results = await Character.findAll({
            order: [[order, dir]],
            where: {
                name: { [Op.like]: `%${query}%` },
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async startsWith(
        query: string,
        order = 'name',
        dir = 'ASC',
    ): Promise<{ id: number }[]> {
        const results = await Character.findAll({
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
        const item = await Character.findByPk(id, {
            attributes: ['image'],
        });
        return item.dataValues.image;
    }

    public static async selectByBook(
        bookId: number,
        order = 'name',
        orderDirection = 'ASC',
    ) {
        const results = await Character.findAll({
            order: [[order, orderDirection]],
            include: {
                model: Book,
                where: { id: bookId },
                attributes: [],
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectByTeam(
        teamId: number,
        order = 'name',
        orderDirection = 'ASC',
    ) {
        const results = await Character.findAll({
            order: [[order, orderDirection]],
            include: {
                model: Team,
                where: { id: teamId },
                attributes: [],
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

        const result = await Character.findOne({
            where: {
                [Op.or]: where,
            },
        });
        return result?.get({ plain: true });
    }

    public static async create(
        character: Omit<Character, 'id'>,
        image: Uint8Array | undefined,
        teamIds: number[],
    ) {
        const tx = await db.transaction();

        const modelToSave: Partial<Character> = {
            ...character,
            lastUpdated: new Date(),
            dateAdded: new Date(),
        };

        if (image) {
            modelToSave.image = Buffer.from(image);
        }

        try {
            const newUser = await Character.create(modelToSave);

            await assignTeams(newUser.dataValues.id, teamIds, tx);

            await tx.commit();
            return newUser.dataValues;
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }

    public static async remove(id: number) {
        await Character.destroy({ where: { id: id } });
    }

    public static async update(
        id: number,
        character: Partial<Character>,
        image: Uint8Array | undefined,
        teamIds: number[],
    ) {
        const tx = await db.transaction();

        const modelToSave: Partial<Character> = {
            ...character,
            lastUpdated: new Date(),
        };

        if (image) {
            modelToSave.image = Buffer.from(image);
        }

        try {
            await Character.update(modelToSave, {
                where: { id: id },
                transaction: tx,
            });

            await assignTeams(id, teamIds, tx);

            await tx.commit();
        } catch (error) {
            await tx.rollback();
            throw error;
        }

        return await this.selectById(id);
    }
}
