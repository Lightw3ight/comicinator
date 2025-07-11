import { CreationAttributes } from 'sequelize';
import { Book } from '../book/book';
import { BookController } from '../book/book-controller';
import { db } from '../db';
import { FieldFilter } from '../models/field-filter.interface';
import { SelectOptions } from '../models/select-options.interface';
import { Library } from './library';
import { LibraryFilter } from './library-filter';

function mapFieldFilters(filters: LibraryFilter[]): FieldFilter<Book>[] {
    return filters.map<FieldFilter<Book>>((f) => {
        let value: any = f.value;

        if (f.field === 'publisherId') {
            value = +value;
        }

        return {
            field: f.field as keyof Book,
            operator: f.operator,
            value,
        };
    });
}

export class LibraryController {
    public static async selectById(id: number) {
        const model = await Library.findByPk(id);
        return model?.get({ plain: true });
    }

    public static async selectAll() {
        const results = await Library.findAll({
            order: [['name', 'ASC']],
        });

        return results.map((r) => r.get({ plain: true }));
    }

    public static async selectFilters(libraryId: number) {
        const results = await LibraryFilter.findAll({
            where: { libraryId },
        });

        return results.map((r) => r.get({ plain: true })) as LibraryFilter[];
    }

    public static async selectGroupedBooks(
        libraryId: number,
        groupField: keyof Book,
        options: Omit<SelectOptions<Book>, 'filter' | 'filters'>,
    ) {
        const lib = await LibraryController.selectById(libraryId);
        const filters = await LibraryController.selectFilters(libraryId);

        const parsedFilters = mapFieldFilters(filters);

        return BookController.selectGrouped(groupField, {
            ...options,
            matchSome: !lib?.matchAll,
            filters: parsedFilters,
        });
    }

    public static async selectBooks(
        libraryId: number,
        options: Omit<SelectOptions<Book>, 'filter' | 'filters'>,
    ) {
        const lib = await LibraryController.selectById(libraryId);
        const filters = await LibraryController.selectFilters(libraryId);

        const parsedFilters = mapFieldFilters(filters);

        return BookController.selectMany({
            ...options,
            matchSome: !lib?.matchAll,
            filters: parsedFilters,
        });
    }

    public static async selectGroupedBooksCount(
        libraryId: number,
        groupField: keyof Book,
        filter?: string,
    ) {
        const lib = await LibraryController.selectById(libraryId);
        const filters = await LibraryController.selectFilters(libraryId);

        const parsedFilters = mapFieldFilters(filters);

        return BookController.selectGroupedCount(groupField, {
            filter,
            matchSome: !lib?.matchAll,
            filters: parsedFilters,
        });
    }

    public static async selectBooksCount(libraryId: number, filter?: string) {
        const lib = await LibraryController.selectById(libraryId);
        const filters = await LibraryController.selectFilters(libraryId);

        const parsedFilters = mapFieldFilters(filters);

        return BookController.selectManyCount({
            filter,
            matchSome: !lib?.matchAll,
            filters: parsedFilters,
        });
    }

    public static async create(
        library: CreationAttributes<Library>,
        filters: CreationAttributes<LibraryFilter>[],
    ) {
        const newLib = await Library.create(library);

        for (const filter of filters) {
            LibraryFilter.create({
                ...filter,
                libraryId: newLib.id,
            });
        }

        return newLib.dataValues;
    }

    public static async update(
        id: number,
        library: CreationAttributes<Library>,
        filters: CreationAttributes<LibraryFilter>[],
    ) {
        await LibraryFilter.destroy({
            where: { libraryId: id },
        });

        await Library.update(library, {
            where: { id: id },
        });

        for (const filter of filters) {
            LibraryFilter.create({
                ...filter,
                libraryId: id,
            });
        }
    }

    public static async remove(id: number) {
        await Library.destroy({ where: { id: id } });
    }
}
