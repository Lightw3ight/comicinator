import { Table } from '../../sql/table';

export const BookTeam = new Table<{ bookId: number; teamId: number }>(
    'BookTeam'
);
