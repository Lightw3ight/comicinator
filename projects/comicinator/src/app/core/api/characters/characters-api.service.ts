import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Character } from '../../models/character.interface';
import { Dictionary } from '../../models/dictionary.interface';
import { CharacterDto } from './dtos/character-dto.interface';

export const columns: (keyof CharacterDto)[] = [
    'name',
    'aliases',
    'creators',
    'summary',
    'description',
    'gender',
    'origin',
    'powers',
    'publisher',
    'realName',
];

@Injectable({ providedIn: 'root' })
export class CharactersApiService {
    private electron = inject(ElectronService);

    public async fetchCharacters(): Promise<Character[]> {
        const sql = `SELECT * FROM character ORDER BY name`;
        const results = await this.electron.sqlSelectAll<CharacterDto>(sql);
        return results.map((b) => ({ ...b }));
    }

    public async fetchCharacter(id: number): Promise<Character> {
        const sql = `SELECT * FROM character where id = ?`;
        const character = await this.electron.sqlSelect<CharacterDto>(sql, id);

        if (!character) {
            throw new Error(`Book with id ${id} not found`);
        }

        return character;
    }

    public async insertCharacter(character: Omit<Character, 'id'>) {
        const fields = Object.keys(character);

        const columnProps = fields.map((c) => `@${c}`);
        const sql = `INSERT INTO character (${fields.join(
            ', '
        )}) VALUES (${columnProps.join(', ')})`;

        const params = createSqlParams(character);
        const id = await this.electron.sqlRun(sql, params);
        return await this.fetchCharacter(id);
    }
}

function createSqlParams(obj: Dictionary): { [key: string]: any } {
    return Object.keys(obj).reduce(
        (acc, key) => ({ ...acc, [`@${key}`]: obj[key] }),
        {}
    );
}
