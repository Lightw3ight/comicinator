import { Book } from '../../models/book.interface';
import { Table } from '../../sql/table';

export const BookTable = new Table<Book>('Book', 'id');
