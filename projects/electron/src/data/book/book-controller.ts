import fs from 'fs';
import { col, fn, Op, Transaction } from 'sequelize';
import { Character } from '../character/character';
import { db } from '../db';
import { Location } from '../location/location';
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

    public static async selectByIds(ids: number[]) {
        const results = await Book.findAll({
            where: { id: ids },
            order: [['title', 'ASC']],
        });
        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectAll() {
        const results = await Book.findAll({
            order: [['coverDate', 'DESC']],
            attributes: { exclude: ['image'] },
        });

        return results.map((r) => r.get({ plain: true }));
    }

    public static async search(query: string, order = 'title', dir = 'ASC') {
        const results = await Book.findAll({
            order: [[order, dir]],
            where: {
                [Op.or]: [
                    {
                        title: { [Op.like]: `%${query}%` },
                    },
                    {
                        series: { [Op.like]: `%${query}%` },
                    },
                ],
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async startsWith(
        query: string,
        order = 'coverDate',
        dir = 'DESC',
    ): Promise<{ id: number }[]> {
        const results = await Book.findAll({
            order: [[order, dir]],
            where: {
                series: { [Op.startsWith]: query },
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectByCharacter(
        characterId: number,
        order = 'coverDate',
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
        order = 'coverDate',
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
        order = 'coverDate',
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

    public static async groupBy(
        field: keyof Book,
        query: string,
        fullSearch = false,
    ) {
        const parsedQuery = fullSearch ? `%${query}%` : `${query}%`;

        const results = await Book.findAll({
            group: field,
            where: { [field]: { [Op.like]: parsedQuery } },
            attributes: [
                [field, 'id'],
                [field, 'name'],
                [fn('COUNT', col('*')), 'bookCount'],
                [fn('MIN', col('filePath')), 'firstFilePath'],
            ],
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectByGroup(field: keyof Book, value: any) {
        const results = await Book.findAll({
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
