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
        return results.map(this.mapCharacterDto);
    }

    public async searchSharacters(search: string): Promise<number[]> {
        const sql = `SELECT id FROM character where name like ? ORDER BY name`;
        const results = await this.electron.sqlSelectAll<{ id: number }>(
            sql,
            `%${search}%`
        );
        return results.map((o) => o.id);
    }

    public async fetchCharacter(id: number): Promise<Character> {
        const sql = `SELECT * FROM character where id = ?`;
        const character = await this.electron.sqlSelect<CharacterDto>(sql, id);

        if (!character) {
            throw new Error(`Book with id ${id} not found`);
        }
        return this.mapCharacterDto(character);
    }

    public async updateCharacter(id: number, character: Partial<Character>) {
        const fields = Object.keys(character).filter((v) => v !== 'id');

        const sqlValueSets = fields.map((field) => `${field} = @${field}`);
        const sql = `UPDATE character SET ${sqlValueSets.join(
            ','
        )} WHERE id = @id`;

        const params = createSqlParams({ ...character, id });

        await this.electron.sqlRun(sql, params);
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

    private mapCharacterDto(dto: CharacterDto): Character {
        return {
            id: dto.id,
            name: dto.name,
            aliases: dto.aliases,
            creators: dto.creators,
            description: dto.description,
            gender: dto.gender,
            origin: dto.origin,
            powers: dto.powers,
            publisher: dto.publisher,
            realName: dto.realName,
            summary: dto.summary,
            image: dto.image
                ? new Blob([new Uint8Array(dto.image)], { type: 'image/jpeg' })
                : undefined,
        };
    }
}

function createSqlParams(obj: Dictionary): { [key: string]: any } {
    return Object.keys(obj).reduce(
        (acc, key) => ({ ...acc, [`@${key}`]: obj[key] }),
        {}
    );
}
