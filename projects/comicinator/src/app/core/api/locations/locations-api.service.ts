import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Location } from '../../models/location.interface';
import { SortDirection } from '../../models/sort-direction.type';
import { SelectOptions } from '../select-options.interface';

@Injectable({ providedIn: 'root' })
export class LocationsApiService {
    private electron = inject(ElectronService);

    public async selectMany(
        filter: string | undefined,
        offset?: number,
        limit?: number,
        sortField: keyof Location = 'name',
        sortDirection: SortDirection = 'ASC',
    ): Promise<Location[]> {
        const options: SelectOptions<Location> = {
            filter,
            offset,
            limit,
            sortField,
            sortDirection,
        };
        return await this.electron.run<Location[]>('locSelectMany', options);
    }

    public async selectManyCount(filter?: string) {
        return await this.electron.run<number>('locSelectManyCount', filter);
    }

    public async selectById(id: number): Promise<Location> {
        return await this.electron.run<Location>('locSelectById', id);
    }

    public async selectByIds(ids: number[]): Promise<Location[]> {
        return await this.electron.run<Location[]>('locSelectByIds', ids);
    }

    public async selectByBook(bookId: number): Promise<Location[]> {
        return await this.electron.run<Location[]>('locSelectByBook', bookId);
    }

    public async findForImport(
        externalId: number | null,
        name: string,
    ): Promise<Location | undefined> {
        return await this.electron.run<Location>(
            'locFindForImport',
            externalId,
            name,
        );
    }

    public async selectImage(locationId: number): Promise<Blob | undefined> {
        const img = await this.electron.run<ArrayBuffer>(
            'locSelectImage',
            locationId,
        );

        if (img) {
            return new Blob([new Uint8Array(img)], { type: 'image/jpeg' });
        }

        return undefined;
    }

    public async remove(locationId: number) {
        await this.electron.run('locRemove', locationId);
    }

    public async create(
        location: Omit<Location, 'id' | 'dateAdded'>,
        imageBlob: Blob | undefined,
    ) {
        const img = await this.blobToArray(imageBlob);
        return await this.electron.run<Location>('locCreate', location, img);
    }

    public async update(
        id: number,
        location: Partial<Location>,
        imageBlob: Blob | undefined,
    ) {
        const img = await this.blobToArray(imageBlob);
        return await this.electron.run<Location>(
            'locUpdate',
            id,
            location,
            img,
        );
    }

    private async blobToArray(blob: Blob | undefined) {
        if (blob == null) {
            return blob;
        }
        const buffer = await blob.arrayBuffer();
        return new Uint8Array(buffer);
    }
}
