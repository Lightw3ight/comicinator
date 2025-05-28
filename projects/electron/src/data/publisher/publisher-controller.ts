import { Op } from 'sequelize';
import { Publisher } from './publisher';

export class PublisherController {
    public static async selectById(id: number) {
        const model = await Publisher.findByPk(id, {
            plain: true,
            attributes: { exclude: ['image'] },
        });
        return model.get({ plain: true });
    }

    public static async selectAll() {
        const results = await Publisher.findAll({
            order: [['name', 'ASC']],
            attributes: { exclude: ['image'] },
        });

        return results.map((r) => r.get({ plain: true }));
    }

    public static async selectImage(
        id: number,
    ): Promise<Buffer<ArrayBufferLike>> {
        const item = await Publisher.findByPk(id, {
            attributes: ['image'],
        });
        return item.dataValues.image;
    }

    public static async search(
        query: string,
        order = 'name',
        dir = 'ASC',
    ): Promise<{ id: number }[]> {
        const results = await Publisher.findAll({
            order: [[order, dir]],
            attributes: ['id'],
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
        const results = await Publisher.findAll({
            order: [[order, dir]],
            where: {
                name: { [Op.startsWith]: query },
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

        const result = await Publisher.findOne({
            where: {
                [Op.or]: where,
            },
        });
        return result?.get({ plain: true });
    }

    public static async create(
        publisher: Omit<Publisher, 'id'>,
        image: Uint8Array | undefined,
    ) {
        const modelToSave: Partial<Publisher> = {
            ...publisher,
            lastUpdated: new Date(),
            dateAdded: new Date(),
        };

        if (image) {
            modelToSave.image = Buffer.from(image);
        }

        const newUser = await Publisher.create(modelToSave);

        return newUser.dataValues;
    }

    public static async remove(id: number) {
        await Publisher.destroy({ where: { id: id } });
    }

    public static async update(
        id: number,
        publisher: Partial<Publisher>,
        image: Uint8Array | undefined,
    ) {
        const modelToSave: Partial<Publisher> = {
            ...publisher,
            lastUpdated: new Date(),
        };

        if (image) {
            modelToSave.image = Buffer.from(image);
        }

        await Publisher.update(modelToSave, {
            where: { id: id },
        });

        return await this.selectById(id);
    }
}
