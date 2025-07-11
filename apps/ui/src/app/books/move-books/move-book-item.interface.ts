import { Book } from '../../core/models/book.interface';

export interface MoveBookItem {
    selected: boolean;
    book: Book;
    outputPath: string;
    samePath: boolean;
}
