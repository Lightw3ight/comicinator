import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { BookGroup } from '../../models/book-group.interface';
import { Book } from '../../models/book.interface';
import { SortDirection } from '../../models/sort-direction.type';
import { SelectOptions } from '../select-options.interface';

@Injectable({ providedIn: 'root' })
export class BooksApiService {
    private electron = inject(ElectronService);

    public async selectMany(
        filter: string | undefined,
        offset: number,
        limit = 100,
        sortField: keyof Book = 'coverDate',
        sortDirection: SortDirection = 'DESC',
    ): Promise<Book[]> {
        const options: SelectOptions<Book> = {
            filter,
            offset,
            limit,
            sortField,
            sortDirection,
        };
        return await this.electron.run<Book[]>('bookSelectMany', options);
    }

    public async selectByLibrary(
        libraryId: number,
        filter: string | undefined,
        offset: number,
        limit = 100,
        sortField: keyof Book = 'coverDate',
        sortDirection: SortDirection = 'DESC',
    ): Promise<Book[]> {
        const options: SelectOptions<Book> = {
            filter,
            offset,
            limit,
            sortField,
            sortDirection,
        };
        return await this.electron.run<Book[]>(
            'libSelectBooks',
            libraryId,
            options,
        );
    }

    public async selectNextInSeries(
        publisherId: number | undefined,
        series: string,
        volume: string | undefined | number,
        currentNumber: string,
    ): Promise<Book | undefined> {
        const results = await this.electron.run<Book>(
            'bookSelectNextBook',
            publisherId,
            series,
            volume,
            currentNumber,
        );
        return results;
    }

    public async selectManyCount(filter?: string) {
        return await this.electron.run<number>('bookSelectManyCount', filter);
    }

    public async selectByLibraryCount(libraryId: number, filter?: string) {
        return await this.electron.run<number>(
            'libSelectBooksCount',
            libraryId,
            filter,
        );
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

    public async setReadDetails(
        id: number,
        currentPage: number,
        pageCount: number,
    ) {
        return await this.electron.run<Book>(
            'bookSetReadDetails',
            id,
            currentPage,
            pageCount,
        );
    }

    public async update(
        book: Omit<Book, 'dateAdded'>,
        characterIds?: number[],
        teamIds?: number[],
        locationIds?: number[],
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
        const value = fieldValue === 'null' ? null : fieldValue;
        return await this.electron.run<Book[]>(
            'bookSelectByGroup',
            field,
            value,
        );
    }

    public async selectGroupedTotal(
        field: keyof Book,
        libraryId?: number,
        filter?: string,
    ) {
        if (libraryId) {
            return await this.electron.run<number>(
                'libSelectGroupedBooksCount',
                libraryId,
                field,
                filter,
            );
        } else {
            return await this.electron.run<number>(
                'bookSelectGroupedCount',
                field,
                filter,
            );
        }
    }

    public async selectGrouped(
        field: keyof Book,
        filter: string | undefined,
        offset: number,
        limit = 100,
        sortField: keyof Book = 'coverDate',
        sortDirection: SortDirection = 'DESC',
        libraryId?: number,
    ): Promise<BookGroup[]> {
        const options: SelectOptions<Book> = {
            filter,
            offset,
            limit,
            sortField,
            sortDirection,
        };

        if (libraryId) {
            return await this.electron.run<BookGroup[]>(
                'libSelectGroupedBooks',
                libraryId,
                field,
                options,
            );
        } else {
            return await this.electron.run<BookGroup[]>(
                'bookSelectGrouped',
                field,
                options,
            );
        }
    }

    public async remove(id: number, removeFile = false): Promise<void> {
        await this.electron.run('bookRemove', id, removeFile);
    }
}
