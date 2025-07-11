import { Op } from 'sequelize';
import { SelectOptions } from './select-options.interface';
import { FilterOperator } from './filter-operator.type';

export function generateWhere(
    defaultFields: string[],
    options: Partial<SelectOptions>,
) {
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
        const sqlFilters = options.filters.map((f) => ({
            [f.field]: {
                [mapOperator(f.operator)]: mapValue(f.value, f.operator),
            },
        }));

        if (options.matchSome) {
            where[Op.or] = sqlFilters;
        } else {
            where[Op.and] = sqlFilters;
        }
        // options.filters.forEach((filter) => {
        //     if (filter.value !== undefined) {
        //         where[filter.field] = { [mapOperator(filter.operator)]: filter.value };
        //     }
        // });
    }

    return where;
}

function mapValue(value: any, operator: FilterOperator) {
    if (typeof value === 'string') {
        switch (operator) {
            case 'not-ends':
                return `%${value}`;
            case 'not-starts':
                return `${value}%`;
            case 'like':
                return `%${value}%`;
            default:
                return value;
        }
    }
    return value;
}

function mapOperator(op: FilterOperator) {
    switch (op) {
        case 'contains':
            return Op.contains;
        case 'ends':
            return Op.endsWith;
        case 'gt':
            return Op.gt;
        case 'gte':
            return Op.gte;
        case 'lt':
            return Op.lt;
        case 'lte':
            return Op.lte;
        case 'ne':
            return Op.ne;
        case 'starts':
            return Op.startsWith;
        case 'like':
            return Op.like;
        case 'not-starts':
        case 'not-ends':
            return Op.notLike;
        default:
            return Op.eq;
    }
}
