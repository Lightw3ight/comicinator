import fs from 'fs';
import { col, fn, Op, Transaction } from 'sequelize';
import { Character } from '../character/character';
import { db } from '../db';
import { Location } from '../location/location';
import { SelectOptions } from '../select-options.interface';
import { Team } from '../team/team';
import { Book } from './book';
import { BookCharacter } from './book-character';
import { BookLocation } from './book-location';
import { BookTeam } from './book-team';

async function assignTeams(bookId: number, teamIds: number[], tx: Transaction) {
    await BookTeam.destroy({
        where: { bookId },
        transaction: tx,
    });

    for (let teamId of teamIds) {
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

    for (let characterId of characterIds) {
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

    for (let locationId of locationIds) {
        await BookLocation.create({ bookId, locationId }, { transaction: tx });
    }
}

export class BookController {
    public static async selectById(id: number) {
        const model = await Book.findByPk(id);
        return model.get({ plain: true });
    }

    public static async selectByFilePath(filePath: string) {
        const model = await Book.findOne({
            where: {
                filePath: { [Op.like]: filePath },
            },
        });
        return model.get({ plain: true });
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
        let where = {};

        if (options.filter) {
            where = {
                [Op.or]: [
                    {
                        title: { [Op.like]: `%${options.filter}%` },
                    },
                    {
                        series: { [Op.like]: `%${options.filter}%` },
                    },
                ],
            };
        }

        const results = await Book.findAll({
            order: [
                [
                    options.sortField ?? 'coverDate',
                    options.sortDirection ?? 'DESC',
                ],
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
            col: groupField,
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
        const results = await Book.findAll({
            order: [['coverDate', 'DESC']],
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
            const newUser = await Book.create(modelToSave);

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

    public static async update(
        id: number,
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
            await Book.update(modelToSave, { where: { id } });
            await assignTeams(id, teamIds, tx);
            await assignCharacters(id, characterIds, tx);
            await assignLocations(id, locationIds, tx);

            await tx.commit();
        } catch (error) {
            await tx.rollback();
            throw error;
        }

        return await this.selectById(id);
    }

    public static async remove(id: number, deleteFile = false) {
        if (deleteFile) {
            const { filePath } = await this.selectById(id);
            await fs.promises.unlink(filePath);
        }

        await Book.destroy({ where: { id: id } });
    }
}
