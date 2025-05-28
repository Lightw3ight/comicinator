import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Character } from '../../models/character.interface';

@Injectable({ providedIn: 'root' })
export class CharactersApiService {
    private electron = inject(ElectronService);

    public async selectAll(): Promise<Character[]> {
        return await this.electron.run<Character[]>('charSelectAll');
    }

    public async selectById(id: number): Promise<Character> {
        return await this.electron.run<Character>('charSelectById', id);
    }

    public async selectByIds(ids: number[]): Promise<Character[]> {
        return await this.electron.run<Character[]>('charSelectByIds', ids);
    }

    public async remove(characterId: number) {
        await this.electron.run<Character[]>('charRemove', characterId);
    }

    public async search(query: string): Promise<Character[]> {
        return await this.electron.run<Character[]>('charSearch', query);
    }

    public async startsWith(filter: string): Promise<Character[]> {
        return await this.electron.run<Character[]>('charStartsWith', filter);
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
    ): Promise<Character | undefined> {
        return await this.electron.run<Character>(
            'charFindForImport',
            externalId,
            name,
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
