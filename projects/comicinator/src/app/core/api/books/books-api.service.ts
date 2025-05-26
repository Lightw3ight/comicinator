import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { BookGroup } from '../../models/book-group.interface';
import { Book } from '../../models/book.interface';
import { Dictionary } from '../../models/dictionary.interface';
import { SqlStatement } from '../../models/sql-statement.interface';
import { QueryGenerator } from '../../sql/query-generator';
import { BookCharacter } from './book-character.table';
import { BookTeam } from './book-team.table';
import { BookTable } from './book.table';
import { BookDto } from './dtos/book-dto.interface';
import { BookLocation } from './book-location.table';

@Injectable({ providedIn: 'root' })
export class BooksApiService {
    private electron = inject(ElectronService);
    private bookQuery = new QueryGenerator(BookTable);
    private bookCharacterQuery = new QueryGenerator(BookCharacter);
    private bookTeamQuery = new QueryGenerator(BookTeam);
    private bookLocationQuery = new QueryGenerator(BookLocation);

    public async fetchAllBooks(): Promise<Book[]> {
        const stmt = this.bookQuery.select('*', undefined, 'coverDate', 'desc');
        const results = await this.electron.sqlSelectAll<BookDto>(stmt);
        return results.map((b) => this.mapToModel(b));
    }

    public async search(search: string): Promise<number[]> {
        const stmt = this.bookQuery.select(
            'id',
            [{ title: `%${search}%` }, { series: `%${search}%` }],
            'title',
        );
        const results = await this.electron.sqlSelectAll<{ id: number }>(stmt);
        return results.map((o) => o.id);
    }

    public async insertBook(
        book: Omit<Book, 'id' | 'dateAdded'>,
        charactersids: number[],
        teamIds: number[],
        locationIds: number[],
    ): Promise<Book> {
        const stmt = this.bookQuery.insert({ ...book, dateAdded: new Date() });
        const id = await this.electron.sqlRun(stmt);
        await this.setCharactersAndTeams(
            id,
            charactersids,
            teamIds,
            locationIds,
        );

        return await this.fetchBook(id);
    }

    public async updateBook(
        book: Omit<Book, 'dateAdded'>,
        characterIds: number[],
        teamIds: number[],
        locationIds: number[],
    ) {
        const { id, ...bookToSave } = book;
        const stmt = this.bookQuery.update({ id }, bookToSave);

        await this.electron.sqlRun(stmt);
        await this.setCharactersAndTeams(
            book.id,
            characterIds,
            teamIds,
            locationIds,
        );
    }

    private async setCharactersAndTeams(
        bookId: number,
        characterIds: number[],
        teamIds: number[],
        locationIds: number[],
    ) {
        const characterInserts = characterIds.map<SqlStatement>((characterId) =>
            this.bookCharacterQuery.insert({ bookId, characterId }),
        );
        const teamInserts = teamIds.map<SqlStatement>((teamId) =>
            this.bookTeamQuery.insert({ bookId, teamId }),
        );
        const locationInserts = locationIds.map((locationId) =>
            this.bookLocationQuery.insert({ bookId, locationId }),
        );
        const deleteExistingCharacterLinks = this.bookCharacterQuery.delete({
            bookId,
        });
        const deleteExistingTeamLinks = this.bookTeamQuery.delete({ bookId });
        const deleteExistingLocationLinks = this.bookLocationQuery.delete({
            bookId,
        });

        await this.electron.sqlTransact([
            deleteExistingCharacterLinks,
            deleteExistingTeamLinks,
            deleteExistingLocationLinks,
            ...characterInserts,
            ...teamInserts,
            ...locationInserts,
        ]);
    }

    public async fetchBook(id: number): Promise<Book> {
        const stmt = this.bookQuery.select('*', { id });
        const book = await this.electron.sqlSelect<BookDto>(stmt);

        if (!book) {
            throw new Error(`Book with id ${id} not found`);
        }

        return {
            ...book,
            dateAdded: new Date(book.dateAdded),
            coverDate: book.coverDate ? new Date(book.coverDate) : undefined,
        };
    }

    public async searchByCharacter(characterId: number): Promise<number[]> {
        const stmt = this.bookCharacterQuery.select(['bookId'], {
            characterId,
        });

        const results = await this.electron.sqlSelectAll<{ bookId: number }>(
            stmt,
        );
        return results.map((o) => o.bookId);
    }

    public async selectByLocation(locationId: number): Promise<number[]> {
        const stmt = this.bookLocationQuery.select(['bookId'], { locationId });
        const results = await this.electron.sqlSelectAll<{
            bookId: number;
        }>(stmt);
        return results.map((o) => o.bookId);
    }

    public async loadGroupData(field: keyof Book): Promise<BookGroup[]> {
        const stmt = this.bookQuery.groupBy(field, {
            [field]: undefined,
            bookCount: 'count(*)',
            firstFilePath: 'MIN(filePath)',
        });

        const results = await this.electron.sqlSelectAll<any>(stmt);
        return results.map<BookGroup>((item) => ({
            id: item[field],
            name: item[field],
            bookCount: item.bookCount,
            firstFilePath: item.firstFilePath,
        }));
    }

    public async getIdsByGroup(
        groupedField: string,
        fieldValue: string,
    ): Promise<number[]> {
        const stmt = this.bookQuery.select(['id'], {
            [groupedField]: fieldValue,
        });
        const results = await this.electron.sqlSelectAll<{ id: number }>(stmt);
        return results.map((o) => o.id);
    }

    public async searchByTeam(teamId: number): Promise<number[]> {
        const stmt = this.bookTeamQuery.select(['bookId'], { teamId });
        const results = await this.electron.sqlSelectAll<{ bookId: number }>(
            stmt,
        );
        return results.map((o) => o.bookId);
    }

    private mapToModel(dto: BookDto): Book {
        const { dateAdded, coverDate, ...rest } = dto;
        return {
            ...rest,
            dateAdded: new Date(dateAdded),
            coverDate: coverDate ? new Date(coverDate) : undefined,
        };
    }
}
