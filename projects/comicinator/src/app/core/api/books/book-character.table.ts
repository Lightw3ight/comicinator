import { Table } from '../../sql/table';

export const BookCharacter = new Table<{ bookId: number; characterId: number }>(
    'BookCharacter'
);
