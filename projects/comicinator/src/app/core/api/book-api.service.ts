import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../electron.service';
import { Book } from '../models/book.interface';
import { BookDto } from './dtos/book-dto.interface';

function createSqlParams(obj: {[key: string]: any}): {[key: string]: any} {
    return Object.keys(obj).reduce((acc, key) => ({ ...acc, [`@${key}`]: obj[key] }), {});
}

@Injectable({ providedIn: 'root' })
export class BookApiService {
    private electron = inject(ElectronService);

    public async selectBooks(): Promise<Book[]> {
        const sql = `SELECT * FROM book`;
        const results = await this.electron.sqlSelectAll<BookDto>(sql);

        return results.map((book) => {
            return {
                ...book,
                dateAdded: new Date(book.dateAdded),
            };
        });
    }

    public async selectBook(id: number): Promise<Book> {
        const sql = `SELECT * FROM book where id = ?`;
        const book = await this.electron.sqlSelect<BookDto>(sql, id);

        if (!book) {
            throw new Error(`Book with id ${id} not found`);
        }

        return {
            ...book,
            dateAdded: new Date(book.dateAdded),
        }
    }

    public async insertBook(book: Omit<Book, 'id' | 'dateAdded'>): Promise<Book> {
        const sql = `INSERT INTO book (filePath, title, series, number, volume, summary, notes, year, month, day, writer, penciler, inker, colorist, letterer, coverArtist, editor, publisher, pageCount, dateAdded, fileSize) VALUES (@filePath, @title, @series, @number, @volume, @summary, @notes, @year, @month, @day, @writer, @penciler, @inker, @colorist, @letterer, @coverArtist, @editor, @publisher, @pageCount, @dateAdded, @fileSize)`;
        const dto: {[key: string]: any} = {
            ...book,
            dateAdded: new Date().toISOString()
        };

        const params = createSqlParams(dto);
        const id = await this.electron.sqlInsert(sql, params);
        return await this.selectBook(id);
    }
}


