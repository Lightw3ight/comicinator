import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { LibraryFilter } from '../../models/library-filter.interface';
import { Library } from '../../models/library.interface';
import { Book } from '../../models/book.interface';

@Injectable({ providedIn: 'root' })
export class LibraryApiService {
    private electron = inject(ElectronService);

    public async selectAll(): Promise<Library[]> {
        return await this.electron.run<Library[]>('libSelectAll');
    }

    public async selectById(id: number): Promise<Library> {
        return await this.electron.run<Library>('libSelectById', id);
    }

    public async selectFilters(libraryId: number): Promise<LibraryFilter[]> {
        const filters = await this.electron.run<LibraryFilter[]>(
            'libSelectFilters',
            libraryId,
        );

        return filters.map((o) => ({
            ...o,
            value: this.parseValue(o.value, o.field as keyof Book),
        }));
    }

    public async remove(libId: number) {
        await this.electron.run('libRemove', libId);
    }

    public async create(
        lib: Omit<Library, 'id' | 'dateAdded'>,
        filters: LibraryFilter[],
    ) {
        const stringFilters = filters.map((o) => ({
            ...o,
            value: this.valueToString(o.value),
        }));
        return await this.electron.run<Library>(
            'libCreate',
            lib,
            stringFilters,
        );
    }

    public async update(
        id: number,
        lib: Partial<Library>,
        filters: LibraryFilter[],
    ) {
        const stringFilters = filters.map((o) => ({
            ...o,
            value: this.valueToString(o.value),
        }));
        return await this.electron.run<Library>(
            'libUpdate',
            id,
            lib,
            stringFilters,
        );
    }

    private valueToString(value: string | Date | number) {
        if (value instanceof Date) {
            return value.toISOString();
        }

        return value.toString();
    }

    private parseValue(value: string, field: keyof Book) {
        if (value == null) {
            return value;
        }

        switch (field) {
            case 'coverDate':
            case 'dateAdded':
            case 'lastUpdated':
                return new Date(value);
            case 'publisherId':
            case 'volume':
                return +value;
            default:
                return value;
        }
    }
}
