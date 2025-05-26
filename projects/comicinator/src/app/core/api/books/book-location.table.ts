import { Table } from '../../sql/table';

export const BookLocation = new Table<{ bookId: number; locationId: number }>(
    'BookLocation'
);
