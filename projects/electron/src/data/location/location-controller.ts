import { Op } from 'sequelize';
import { Book } from '../book/book';
import { Location } from './location';

export class LocationController {
    public static async selectById(id: number) {
        const model = await Location.findByPk(id, {
            plain: true,
            attributes: { exclude: ['image'] },
        });
        return model.get({ plain: true });
    }

    public static async selectByIds(ids: number[]) {
        const results = await Location.findAll({
            where: { id: ids },
            order: [['name', 'ASC']],
        });
        return results.map((o) => o.get({ plain: true }));
    }

    public static async selectAll() {
        const results = await Location.findAll({
            order: [['name', 'ASC']],
            attributes: { exclude: ['image'] },
        });

        return results.map((r) => r.get({ plain: true }));
    }

    public static async selectImage(
        id: number,
    ): Promise<Buffer<ArrayBufferLike>> {
        const item = await Location.findByPk(id, {
            attributes: ['image'],
        });
        return item.dataValues.image;
    }

    public static async search(query: string, order = 'name', dir = 'ASC') {
        const results = await Location.findAll({
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

        const result = await Location.findOne({
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
        const results = await Location.findAll({
            order: [[order, dir]],
            where: {
                name: { [Op.startsWith]: query },
            },
        });

        return results.map((o) => o.get({ plain: true }));
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
        };

        if (image) {
            modelToSave.image = Buffer.from(image);
        }

        const newUser = await Location.create(modelToSave);

        return newUser.dataValues;
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
        };

        if (image) {
            modelToSave.image = Buffer.from(image);
        }

        await Location.update(modelToSave, {
            where: { id: id },
        });

        return await this.selectById(id);
    }
}
