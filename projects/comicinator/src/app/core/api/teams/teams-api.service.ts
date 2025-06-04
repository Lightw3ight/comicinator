import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { SortDirection } from '../../models/sort-direction.type';
import { Team } from '../../models/team.interface';
import { SelectOptions } from '../select-options.interface';

@Injectable({ providedIn: 'root' })
export class TeamsApiService {
    private electron = inject(ElectronService);

    public async selectMany(
        filter: string | undefined,
        offset?: number,
        limit?: number,
        sortField: keyof Team = 'name',
        sortDirection: SortDirection = 'ASC',
    ): Promise<Team[]> {
        const options: SelectOptions<Team> = {
            filter,
            offset,
            limit,
            sortField,
            sortDirection,
        };
        return await this.electron.run<Team[]>('teamSelectMany', options);
    }

    public async selectManyCount(filter?: string) {
        return await this.electron.run<number>('teamSelectManyCount', filter);
    }

    public async selectById(id: number): Promise<Team> {
        return await this.electron.run<Team>('teamSelectById', id);
    }

    public async selectByIds(ids: number[]): Promise<Team[]> {
        return await this.electron.run<Team[]>('teamSelectByIds', ids);
    }

    public async selectByExternalIds(externalIds: number[]): Promise<number[]> {
        return await this.electron.run<number[]>(
            'teamSelectByExternalIds',
            externalIds,
        );
    }

    public async fetchTeam(id: number): Promise<Team> {
        const team = await this.electron.run<Team>('teamSelectById', id);

        if (!team) {
            throw new Error(`Team with id ${id} not found`);
        }

        return team;
    }

    public async selectByCharacter(characterId: number): Promise<Team[]> {
        const results = await this.electron.run<Team[]>(
            'teamSelectByCharacter',
            characterId,
        );

        return results;
    }

    public async selectByBook(bookId: number): Promise<Team[]> {
        return await this.electron.run<Team[]>('teamSelectByBook', bookId);
    }

    public async findForImport(
        externalId: number | null,
        name: string,
        publisherId: number | undefined,
    ): Promise<Team | undefined> {
        return await this.electron.run<Team>(
            'teamFindForImport',
            externalId,
            name,
            publisherId,
        );
    }

    public async selectImage(teamId: number): Promise<Blob | undefined> {
        const img = await this.electron.run<ArrayBuffer>(
            'teamSelectImage',
            teamId,
        );

        if (img) {
            return new Blob([new Uint8Array(img)], { type: 'image/jpeg' });
        }

        return undefined;
    }

    public async remove(teamId: number) {
        await this.electron.run<void>('teamRemove', teamId);
    }

    public async create(
        team: Omit<Team, 'id' | 'dateAdded'>,
        imageBlob: Blob | undefined,
        characterIds: number[],
    ) {
        const img = await this.blobToArray(imageBlob);
        return await this.electron.run<Team>(
            'teamCreate',
            team,
            img,
            characterIds,
        );
    }

    public async updateTeam(
        id: number,
        team: Partial<Team>,
        imageBlob: Blob | undefined,
        characterIds: number[],
    ) {
        const img = await this.blobToArray(imageBlob);
        return await this.electron.run<Team>(
            'teamUpdate',
            id,
            team,
            img,
            characterIds,
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
