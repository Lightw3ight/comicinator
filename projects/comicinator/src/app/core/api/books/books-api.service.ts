import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Book } from '../../models/book.interface';
import { Dictionary } from '../../models/dictionary.interface';
import { SqlStatement } from '../../models/sql-statement.interface';
import { BookDto } from './dtos/book-dto.interface';

const columns: (keyof BookDto)[] = [
    'filePath',
    'title',
    'series',
    'number',
    'volume',
    'summary',
    'notes',
    'year',
    'month',
    'day',
    'writer',
    'penciler',
    'inker',
    'colorist',
    'letterer',
    'coverArtist',
    'editor',
    'publisher',
    'pageCount',
    'dateAdded',
    'fileSize',
];

@Injectable({ providedIn: 'root' })
export class BooksApiService {
    private electron = inject(ElectronService);

    public async fetchAllBooks(): Promise<Book[]> {
        const sql = `SELECT * FROM book`;
        const results = await this.electron.sqlSelectAll<BookDto>(sql);
        return results.map((b) => this.mapToModel(b));
    }

    public async insertBook(
        book: Omit<Book, 'id' | 'dateAdded'>,
        charactersids: number[],
        teamIds: number[]
    ): Promise<Book> {
        const columnProps = columns.map((c) => `@${c}`);
        const sql = `INSERT INTO book (${columns.join(
            ', '
        )}) VALUES (${columnProps.join(', ')})`;
        const dto: Dictionary = {
            ...book,
            dateAdded: new Date().toISOString(),
        };

        const params = createSqlParams(dto);
        const id = await this.electron.sqlRun(sql, params);
        await this.setCharactersAndTeams(id, charactersids, teamIds);

        return await this.fetchBook(id);
    }

    private async setCharactersAndTeams(
        bookId: number,
        characterIds: number[],
        teamIds: number[]
    ) {
        const characterInserts = characterIds.map<SqlStatement>((id) => ({
            sql: `INSERT INTO BookCharacter(bookId, characterId) VALUES(?,?)`,
            args: [bookId, id],
        }));

        const teamInserts = teamIds.map<SqlStatement>((id) => ({
            sql: `INSERT INTO BookTeam(bookId, teamId) VALUES(?,?)`,
            args: [bookId, id],
        }));

        const deleteExistingCharacterLinks: SqlStatement = {
            sql: 'DELETE FROM BookCharacter WHERE bookId = ?',
            args: [bookId],
        };

        const deleteExistingTeamLinks: SqlStatement = {
            sql: 'DELETE FROM BookTeam WHERE bookId = ?',
            args: [bookId],
        };
        await this.electron.sqlTransact([
            deleteExistingCharacterLinks,
            deleteExistingTeamLinks,
            ...characterInserts,
            ...teamInserts,
        ]);
    }

    public async fetchBook(id: number): Promise<Book> {
        const sql = `SELECT * FROM book where id = ?`;
        const book = await this.electron.sqlSelect<BookDto>(sql, id);

        if (!book) {
            throw new Error(`Book with id ${id} not found`);
        }

        return {
            ...book,
            dateAdded: new Date(book.dateAdded),
        };
    }

    private mapToModel(dto: BookDto): Book {
        const { dateAdded, ...rest } = dto;
        return {
            ...rest,
            dateAdded: new Date(dateAdded),
        };
    }
}

function createSqlParams(obj: Dictionary): { [key: string]: any } {
    return Object.keys(obj).reduce(
        (acc, key) => ({ ...acc, [`@${key}`]: obj[key] }),
        {}
    );
}
