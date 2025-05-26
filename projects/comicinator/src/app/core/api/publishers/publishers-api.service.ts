import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Dictionary } from '../../models/dictionary.interface';
import { Publisher } from '../../models/publisher.interface';
import { PublisherDto } from './dtos/publisher-dto.interface';

@Injectable({ providedIn: 'root' })
export class PublishersApiService {
    private electron = inject(ElectronService);

    public async fetchPublishers(): Promise<Publisher[]> {
        const sql = `SELECT * FROM Publisher`;
        const results = await this.electron.sqlSelectAll<PublisherDto>(sql);
        return results.map((t) => this.mapToModel(t));
    }

    public async fetchPublisher(id: number): Promise<Publisher> {
        const sql = `SELECT * FROM Publisher WHERE id = ?`;
        const publisher = await this.electron.sqlSelect<PublisherDto>(sql, id);

        if (!publisher) {
            throw new Error(`Publisher with id ${id} not found`);
        }

        return this.mapToModel(publisher);
    }

    public async insertPublisher(publisher: Omit<Publisher, 'id'>) {
        const fields = Object.keys(publisher);

        const columnProps = fields.map((c) => `@${c}`);
        const sql = `INSERT INTO Publisher (${fields.join(
            ', '
        )}) VALUES (${columnProps.join(', ')})`;

        const params = createSqlParams(this.mapToDto(publisher as Publisher));
        const id = await this.electron.sqlRun(sql, params);
        return await this.fetchPublisher(id);
    }

    private mapToModel(dto: PublisherDto): Publisher {
        const { dateAdded, ...rest } = dto;

        return {
            ...rest,
            dateAdded: new Date(dateAdded),
        };
    }

    private mapToDto(model: Publisher): PublisherDto {
        const { dateAdded, ...rest } = model;

        return {
            ...rest,
            dateAdded: dateAdded.toISOString(),
        };
    }
}

function createSqlParams(obj: Dictionary): { [key: string]: any } {
    return Object.keys(obj).reduce(
        (acc, key) => ({ ...acc, [`@${key}`]: obj[key] }),
        {}
    );
}
