import { Op, Transaction } from 'sequelize';
import { Book } from '../book/book';
import { Character } from '../character/character';
import { db } from '../db';
import { SelectOptions } from '../select-options.interface';
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

    public static async selectMany(options: SelectOptions<Book>) {
        let where = {};

        if (options.filter) {
            where = {
                name: { [Op.like]: `%${options.filter}%` },
            };
        }

        const results = await Team.findAll({
            order: [
                [options.sortField ?? 'name', options.sortDirection ?? 'ASC'],
            ],
            attributes: { exclude: ['image'] },
            where,
            limit: options.limit,
            offset: options.offset,
        });

        return results.map((r) => r.get({ plain: true }));
    }

    public static async selectManyCount(filter: string) {
        let where = {};

        if (filter) {
            where = {
                name: { [Op.like]: `%${filter}%` },
            };
        }

        return await Team.count({ where });
    }

    public static async findForImport(
        externalId: number | null,
        name: string,
        publisherId: number | undefined,
    ) {
        if (externalId != null) {
            const result = await Team.findOne({ where: { externalId } });

            if (result) {
                return result?.get({ plain: true });
            }
        }

        const where: any = {
            name: { [Op.like]: name },
        };

        if (externalId != null) {
            where['externalId'] = null;
        }

        if (publisherId != null) {
            where['publisherId'] = publisherId;
        }

        const result = await Team.findOne({
            where: where,
        });
        return result?.get({ plain: true });
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
            image: image ? Buffer.from(image) : null,
        };

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
            image: image ? Buffer.from(image) : null,
        };

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
