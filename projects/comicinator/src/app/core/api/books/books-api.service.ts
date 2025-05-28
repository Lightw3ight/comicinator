import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { BookGroup } from '../../models/book-group.interface';
import { Book } from '../../models/book.interface';

@Injectable({ providedIn: 'root' })
export class BooksApiService {
    private electron = inject(ElectronService);

    public async selectAll(): Promise<Book[]> {
        return await this.electron.run<Book[]>('bookSelectAll');
    }

    public async search(query: string): Promise<Book[]> {
        return await this.electron.run<Book[]>('bookSearch', query);
    }

    public async startsWith(filter: string): Promise<Book[]> {
        return await this.electron.run<Book[]>('bookStartsWith', filter);
    }

    public async create(
        book: Omit<Book, 'id' | 'dateAdded'>,
        characterIds: number[],
        teamIds: number[],
        locationIds: number[],
    ): Promise<Book> {
        return await this.electron.run<Book>(
            'bookCreate',
            book,
            characterIds,
            teamIds,
            locationIds,
        );
    }

    public async update(
        book: Omit<Book, 'dateAdded'>,
        characterIds: number[],
        teamIds: number[],
        locationIds: number[],
    ): Promise<Book> {
        return await this.electron.run<Book>(
            'bookUpdate',
            book.id,
            book,
            characterIds,
            teamIds,
            locationIds,
        );
    }

    public async selectById(id: number): Promise<Book> {
        return await this.electron.run<Book>('bookSelectById', id);
    }

    public async selectByFilePath(filePath: string): Promise<Book | undefined> {
        return await this.electron.run<Book>('bookSelectByFilePath', filePath);
    }

    public async selectByCharacter(characterId: number): Promise<Book[]> {
        const results = await this.electron.run<Book[]>(
            'bookSelectByCharacter',
            characterId,
        );

        return results;
    }

    public async selectByTeam(teamId: number): Promise<Book[]> {
        return await this.electron.run<Book[]>('bookSelectByTeam', teamId);
    }

    public async selectByLocation(locationId: number): Promise<number[]> {
        const results = await this.electron.run<{ bookId: number }[]>(
            'bookSelectByLocation',
            locationId,
        );
        return results.map((o) => o.bookId);
    }

    public async selectByGroup(
        field: string,
        fieldValue: any,
    ): Promise<Book[]> {
        return await this.electron.run<Book[]>(
            'bookSelectByGroup',
            field,
            fieldValue,
        );
    }

    public async groupBy(
        field: keyof Book,
        filter: string,
        fullSearch = false,
    ): Promise<BookGroup[]> {
        return await this.electron.run<BookGroup[]>(
            'bookGroupBy',
            field,
            filter,
            fullSearch,
        );
    }

    public async remove(id: number, removeFile = false): Promise<void> {
        await this.electron.run('bookRemove', id, removeFile);
    }
}
