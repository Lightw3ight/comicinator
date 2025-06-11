import { Op } from 'sequelize';
import { SelectOptions } from './select-options.interface';

export function generateWhere(defaultFields: string[], options: SelectOptions) {
    const where: any = {};

    if (options.filter !== undefined) {
        if (defaultFields.length > 1) {
            where[Op.or] = defaultFields.map((field) => ({
                [field]: { [Op.like]: `%${options.filter}%` },
            }));
        } else {
            where[defaultFields[0]] = { [Op.like]: `%${options.filter}%` };
        }
    }

    if (options.filters) {
        options.filters.forEach((filter) => {
            if (filter.value !== undefined) {
                switch (filter.operator) {
                    case '<':
                        where[filter.field] = { [Op.lt]: filter.value };
                        break;
                    case '>':
                        where[filter.field] = { [Op.gt]: filter.value };
                        break;
                    case '<=':
                        where[filter.field] = { [Op.lte]: filter.value };
                        break;
                    case '>=':
                        where[filter.field] = { [Op.gte]: filter.value };
                        break;
                    case 'like':
                        where[filter.field] = { [Op.like]: filter.value };
                        break;
                    default:
                        where[filter.field] = filter.value;
                }
            }
        });
    }

    return where;
}
