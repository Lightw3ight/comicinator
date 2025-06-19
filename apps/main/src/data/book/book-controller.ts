import fs from 'fs';
import { col, fn, Op, Sequelize, Transaction } from 'sequelize';
import { Character } from '../character/character';
import { db } from '../db';
import { Location } from '../location/location';
import { SelectOptions } from '../models/select-options.interface';
import { Team } from '../team/team';
import { Book } from './book';
import { BookCharacter } from './book-character';
import { BookLocation } from './book-location';
import { BookTeam } from './book-team';
import { generateWhere } from '../models/generate-where';
import { createBookSort } from './create-book-sort';

async function assignTeams(bookId: number, teamIds: number[], tx: Transaction) {
    await BookTeam.destroy({
        where: { bookId },
        transaction: tx,
    });

    for (const teamId of teamIds) {
        await BookTeam.create({ bookId, teamId }, { transaction: tx });
    }
}

async function assignCharacters(
    bookId: number,
    characterIds: number[],
    tx: Transaction,
) {
    await BookCharacter.destroy({
        where: { bookId },
        transaction: tx,
    });

    for (const characterId of characterIds) {
        await BookCharacter.create(
            { bookId, characterId },
            { transaction: tx },
        );
    }
}

async function assignLocations(
    bookId: number,
    locationIds: number[],
    tx: Transaction,
) {
    await BookLocation.destroy({
        where: { bookId },
        transaction: tx,
    });

    for (const locationId of locationIds) {
        await BookLocation.create({ bookId, locationId }, { transaction: tx });
    }
}

export class BookController {
    public static async selectById(id: number) {
        const model = await Book.findByPk(id);
        return model?.get({ plain: true });
    }

    public static async selectByFilePath(filePath: string) {
        const model = await Book.findOne({
            where: {
                filePath: { [Op.like]: filePath },
            },
        });
        return model?.get({ plain: true });
    }

    public static async selectByIds(
        ids: number[],
        order: keyof Book = 'coverDate',
        dir = 'DESC',
    ) {
        const results = await Book.findAll({
            where: { id: ids },
            order: [[order, dir]],
        });
        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectMany(options: SelectOptions<Book>) {
        const where = generateWhere(['title', 'series'], options);

        const results = await Book.findAll({
            order: [createBookSort(options.sortField!, options.sortDirection)],
            attributes: { exclude: ['image'] },
            where,
            limit: options.limit,
            offset: options.offset,
        });

        return results.map((r) => r.get({ plain: true }));
    }

    public static async selectNextBook(
        publisherId: number | undefined,
        series: string,
        volume: string | undefined,
        currentNumber: number,
    ) {
        const results = await Book.findAll({
            order: [
                [Sequelize.literal('CAST(number AS INTEGER)'), 'ASC'],
                ['coverDate', 'ASC'],
            ],
            attributes: { exclude: ['image'] },
            where: {
                [Op.and]: [
                    Sequelize.literal(
                        `CAST(number AS INTEGER) > ${currentNumber}`,
                    ),
                    { publisherId },
                    { series },
                    { volume },
                ],
            },
            limit: 1,
            offset: 0,
        });

        return results.map((r) => r.get({ plain: true }))[0];
    }

    public static async selectManyCount(filter: string) {
        let where = {};

        if (filter) {
            where = {
                [Op.or]: [
                    {
                        title: { [Op.like]: `%${filter}%` },
                    },
                    {
                        series: { [Op.like]: `%${filter}%` },
                    },
                ],
            };
        }

        return await Book.count({ where });
    }

    public static async selectByCharacter(
        characterId: number,
        order: keyof Book = 'coverDate',
        orderDirection = 'DESC',
    ) {
        const results = await Book.findAll({
            order: [[order, orderDirection]],
            include: {
                model: Character,
                where: { id: characterId },
                attributes: [],
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectByTeam(
        teamId: number,
        order: keyof Book = 'coverDate',
        orderDirection = 'DESC',
    ) {
        const results = await Book.findAll({
            order: [[order, orderDirection]],
            include: {
                model: Team,
                where: { id: teamId },
                attributes: [],
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectByLocation(
        locationId: number,
        order: keyof Book = 'coverDate',
        orderDirection = 'DESC',
    ) {
        const results = await Book.findAll({
            order: [[order, orderDirection]],
            include: {
                model: Location,
                where: { id: locationId },
                attributes: [],
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectGroupedCount(groupField: string, filter: string) {
        let where = {};

        if (filter) {
            where = {
                [Op.or]: [
                    {
                        title: { [Op.like]: `%${filter}%` },
                    },
                    {
                        series: { [Op.like]: `%${filter}%` },
                    },
                ],
            };
        }

        return await Book.count({
            where,
            col: groupField ?? 'title',
            distinct: true,
        });
    }

    public static async selectGrouped(
        field: keyof Book,
        options: SelectOptions<Book>,
    ) {
        const where =
            options.filter == null
                ? {}
                : { [field]: { [Op.like]: `%${options.filter}%` } };

        const results = await Book.findAll({
            group: field,
            order: [
                [
                    options.sortField ?? 'coverDate',
                    options.sortDirection ?? 'DESC',
                ],
            ],
            where: where,
            offset: options.offset,
            limit: options.limit,
            attributes: [
                [field, 'id'],
                [field, 'name'],
                [fn('COUNT', col('*')), 'bookCount'],
                [fn('MAX', col('filePath')), 'firstFilePath'],
            ],
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectByGroup(field: keyof Book, value: any) {
        value = value === '' ? null : value;

        const results = await Book.findAll({
            order: [
                ['coverDate', 'DESC'],
                [Sequelize.literal('CAST(number AS INTEGER)'), 'DESC'],
            ],
            where: { [field]: value },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async create(
        book: Omit<Book, 'id'>,
        characterIds: number[],
        teamIds: number[],
        locationIds: number[],
    ) {
        const tx = await db.transaction();

        const modelToSave: Partial<Book> = {
            ...book,
            lastUpdated: new Date(),
            dateAdded: new Date(),
        };

        try {
            const newUser = await Book.create(modelToSave as any);

            await assignTeams(newUser.dataValues.id, teamIds, tx);
            await assignCharacters(newUser.dataValues.id, characterIds, tx);
            await assignLocations(newUser.dataValues.id, locationIds, tx);

            await tx.commit();
            return newUser.get({ plain: true });
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }

    public static async setReadDetails(
        id: number,
        currentPage: number,
        pageCount: number,
    ) {
        await Book.update(
            { pageCount, currentPage, lastOpened: new Date() },
            { where: { id } },
        );

        return await this.selectById(id);
    }

    public static async update(
        id: number,
        book: Omit<Book, 'id'>,
        characterIds?: number[],
        teamIds?: number[],
        locationIds?: number[],
    ) {
        const tx = await db.transaction();

        const modelToSave: Partial<Book> = {
            ...book,
            lastUpdated: new Date(),
        };

        try {
            await Book.update(modelToSave, { where: { id } });

            if (teamIds != null) {
                await assignTeams(id, teamIds, tx);
            }
            if (characterIds != null) {
                await assignCharacters(id, characterIds, tx);
            }
            if (locationIds != null) {
                await assignLocations(id, locationIds, tx);
            }

            await tx.commit();
        } catch (error) {
            await tx.rollback();
            throw error;
        }

        return await this.selectById(id);
    }

    public static async remove(id: number, deleteFile = false) {
        if (deleteFile) {
            const book = await this.selectById(id);
            if (book) {
                const { filePath } = book;
                await fs.promises.unlink(filePath);
            }

            await Book.destroy({ where: { id: id } });
        }
    }
}
