import { OrderItem, Sequelize } from 'sequelize';

export function createBookSort(
    field: string,
    sortDirection?: 'ASC' | 'DESC',
): OrderItem {
    if (field === 'number') {
        return [
            Sequelize.literal('CAST(number AS INTEGER)'),
            sortDirection ?? 'DESC',
        ];
    }
    return [field ?? 'coverDate', sortDirection ?? 'DESC'];
}
