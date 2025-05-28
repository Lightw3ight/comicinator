import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Team } from '../../models/team.interface';

@Injectable({ providedIn: 'root' })
export class TeamsApiService {
    private electron = inject(ElectronService);

    public async search(query: string): Promise<Team[]> {
        return await this.electron.run<Team[]>('teamSearch', query);
    }

    public async selectAll(): Promise<Team[]> {
        return await this.electron.run<Team[]>('teamSelectAll');
    }

    public async startsWith(filter: string): Promise<Team[]> {
        return await this.electron.run<Team[]>('teamStartsWith', filter);
    }

    public async selectById(id: number): Promise<Team> {
        return await this.electron.run<Team>('teamSelectById', id);
    }

    public async selectByIds(ids: number[]): Promise<Team[]> {
        return await this.electron.run<Team[]>('teamSelectByIds', ids);
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
    ): Promise<Team | undefined> {
        return await this.electron.run<Team>(
            'teamFindForImport',
            externalId,
            name,
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
