import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Character } from '../../models/character.interface';
import { SortDirection } from '../../models/sort-direction.type';
import { SelectOptions } from '../select-options.interface';

@Injectable({ providedIn: 'root' })
export class CharactersApiService {
    private electron = inject(ElectronService);

    public async selectMany(
        filter: string | undefined,
        offset?: number,
        limit?: number,
        sortField: keyof Character = 'name',
        sortDirection: SortDirection = 'ASC',
    ): Promise<Character[]> {
        const options: SelectOptions<Character> = {
            filter,
            offset,
            limit,
            sortField,
            sortDirection,
        };
        return await this.electron.run<Character[]>('charSelectMany', options);
    }

    public async selectManyCount(filter?: string) {
        return await this.electron.run<number>('charSelectManyCount', filter);
    }

    public async selectById(id: number): Promise<Character> {
        return await this.electron.run<Character>('charSelectById', id);
    }

    public async selectByIds(ids: number[]): Promise<Character[]> {
        return await this.electron.run<Character[]>('charSelectByIds', ids);
    }

    public async remove(characterId: number) {
        await this.electron.run('charRemove', characterId);
    }

    public async selectByBook(bookId: number): Promise<Character[]> {
        return await this.electron.run<Character[]>('charSelectByBook', bookId);
    }

    public async selectByTeam(teamId: number): Promise<Character[]> {
        return await this.electron.run<Character[]>('charSelectByTeam', teamId);
    }

    public async findForImport(
        externalId: number | null,
        name: string,
        publisherId: number | undefined,
    ): Promise<Character | undefined> {
        return await this.electron.run<Character>(
            'charFindForImport',
            externalId,
            name,
            publisherId,
        );
    }

    public async selectByExternalIds(externalIds: number[]): Promise<number[]> {
        return await this.electron.run<number[]>(
            'charSelectByExternalIds',
            externalIds,
        );
    }

    public async selectImage(characterId: number): Promise<Blob | undefined> {
        const img = await this.electron.run<ArrayBuffer>(
            'charSelectImage',
            characterId,
        );

        if (img) {
            return new Blob([new Uint8Array(img)], { type: 'image/jpeg' });
        }

        return undefined;
    }

    public async update(
        id: number,
        character: Partial<Character>,
        imageBlob: Blob | undefined,
        teamIds: number[],
    ): Promise<Character> {
        const img = await this.blobToArray(imageBlob);
        return await this.electron.run<Character>(
            'charUpdate',
            id,
            character,
            img,
            teamIds,
        );
    }

    public async insert(
        character: Omit<Character, 'id'>,
        imageBlob: Blob | undefined,
        teamIds: number[] = [],
    ): Promise<Character> {
        const img = await this.blobToArray(imageBlob);

        return await this.electron.run<Character>(
            'charCreate',
            character,
            img,
            teamIds,
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
