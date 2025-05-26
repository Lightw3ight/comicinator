import { Book } from '../models/book.interface';

export interface BookImportResult {
    book: Partial<Book>;
    characterIds: number[];
    teamIds: number[];
    locationIds: number[];
}
