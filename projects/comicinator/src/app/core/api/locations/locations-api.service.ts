import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Location } from '../../models/location.interface';
import { QueryGenerator } from '../../sql/query-generator';
import { BookLocation } from '../books/book-location.table';
import { LocationDto } from './dtos/locations-dto.interface';
import { LocationTable } from './location-table';

@Injectable({ providedIn: 'root' })
export class LocationsApiService {
    private electron = inject(ElectronService);
    private query = new QueryGenerator(LocationTable);
    private bookLocationQuery = new QueryGenerator(BookLocation);

    public async fetchLocations(): Promise<Location[]> {
        const stmt = this.query.select('*');
        const results = await this.electron.sqlSelectAll<LocationDto>(stmt);
        return results.map((t) => this.mapToModel(t));
    }

    public async search(query: string): Promise<number[]> {
        const stmt = this.query.select(['id'], { name: `%${query}%` });
        const results = await this.electron.sqlSelectAll<{ id: number }>(stmt);
        return results.map((t) => t.id);
    }

    public async fetchLocation(id: number): Promise<Location> {
        const stmt = this.query.select('*', { id });
        const location = await this.electron.sqlSelect<LocationDto>(stmt);

        if (!location) {
            throw new Error(`Location with id ${id} not found`);
        }

        return this.mapToModel(location);
    }

    public async selectByBook(bookId: number): Promise<number[]> {
        const stmt = this.bookLocationQuery.select(['locationId'], { bookId });
        const results = await this.electron.sqlSelectAll<{
            locationId: number;
        }>(stmt);
        return results.map((o) => o.locationId);
    }

    public async insertLocation(location: Omit<Location, 'id' | 'dateAdded'>) {
        const stmt = this.query.insert({ ...location, dateAdded: new Date() });

        const id = await this.electron.sqlRun(stmt);
        return await this.fetchLocation(id);
    }

    public async updateLocation(id: number, location: Partial<Location>) {
        const stmt = this.query.update({ id }, location);
        await this.electron.sqlRun(stmt);
    }

    private mapToModel(dto: LocationDto): Location {
        const { image, dateAdded, ...rest } = dto;

        return {
            ...rest,
            dateAdded: new Date(dateAdded),
            image: image
                ? new Blob([new Uint8Array(image)], { type: 'image/jpeg' })
                : undefined,
        };
    }
}
