import { Op } from 'sequelize';
import { Book } from '../book/book';
import { SelectOptions } from '../select-options.interface';
import { Location } from './location';

export class LocationController {
    public static async selectById(id: number) {
        const model = await Location.findByPk(id, {
            plain: true,
            attributes: { exclude: ['image'] },
        });
        return model.get({ plain: true });
    }

    public static async selectMany(options: SelectOptions<Location>) {
        let where = {};

        if (options.filter) {
            where = {
                name: { [Op.like]: `%${options.filter}%` },
            };
        }

        const results = await Location.findAll({
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

        return await Location.count({ where });
    }

    public static async selectByIds(ids: number[]) {
        const results = await Location.findAll({
            where: { id: ids },
            order: [['name', 'ASC']],
        });
        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectImage(
        id: number,
    ): Promise<Buffer<ArrayBufferLike>> {
        const item = await Location.findByPk(id, {
            attributes: ['image'],
        });
        return item.dataValues.image;
    }

    public static async findForImport(externalId: number | null, name: string) {
        let where: any[];

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
        } else {
            where = [
                {
                    name: { [Op.like]: name },
                },
            ];
        }

        const result = await Location.findOne({
            where: {
                [Op.or]: where,
            },
        });
        return result?.get({ plain: true });
    }

    public static async selectByBook(
        bookId: number,
        order = 'name',
        orderDirection = 'ASC',
    ) {
        const results = await Location.findAll({
            order: [[order, orderDirection]],
            include: {
                model: Book,
                where: { id: bookId },
                attributes: [],
            },
        });

        return results.map((o) => o.get({ plain: true }));
    }

    public static async create(
        location: Omit<Location, 'id'>,
        image: Uint8Array | undefined,
    ) {
        const modelToSave: Partial<Location> = {
            ...location,
            lastUpdated: new Date(),
            dateAdded: new Date(),
            image: image ? Buffer.from(image) : null,
        };

        const newUser = await Location.create(modelToSave);

        const data = newUser.get({ plain: true });
        console.log('created location', data.id);
        return data;
    }

    public static async remove(id: number) {
        await Location.destroy({ where: { id: id } });
    }

    public static async update(
        id: number,
        location: Partial<Location>,
        image: Uint8Array | undefined,
    ) {
        const modelToSave: Partial<Location> = {
            ...location,
            lastUpdated: new Date(),
            image: image ? Buffer.from(image) : null,
        };

        await Location.update(modelToSave, {
            where: { id: id },
        });

        return await this.selectById(id);
    }
}
