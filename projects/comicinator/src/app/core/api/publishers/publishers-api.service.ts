import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Dictionary } from '../../models/dictionary.interface';
import { Publisher } from '../../models/publisher.interface';
import { PublisherDto } from './dtos/publisher-dto.interface';

@Injectable({ providedIn: 'root' })
export class PublishersApiService {
    private electron = inject(ElectronService);

    public async selectAll(): Promise<Publisher[]> {
        return await this.electron.run<Publisher[]>('pubSelectAll');
    }

    public async search(query: string): Promise<number[]> {
        const results = await this.electron.run<Pick<Publisher, 'id'>[]>(
            'pubSearch',
            query,
        );
        return results.map((o) => o.id);
    }

    public async selectById(id: number): Promise<Publisher> {
        return await this.electron.run<Publisher>('pubSelectById', id);
    }

    public async findForImport(
        externalId: number | null,
        name: string,
    ): Promise<Publisher | undefined> {
        return await this.electron.run<Publisher>(
            'pubFindForImport',
            externalId,
            name,
        );
    }

    public async create(publisher: Omit<Publisher, 'id'>) {
        return await this.electron.run<Publisher>('pubCreate', publisher);
    }

    public async update(id: number, publisher: Omit<Publisher, 'id'>) {
        return await this.electron.run<Publisher>('pubUpdate', id, publisher);
    }
}
