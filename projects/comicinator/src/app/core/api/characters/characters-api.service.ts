import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Character } from '../../models/character.interface';
import { Dictionary } from '../../models/dictionary.interface';
import { Gender } from '../../models/gender.enum';
import { SqlStatement } from '../../models/sql-statement.interface';
import { QueryGenerator } from '../../sql/query-generator';
import { CharacterTable } from './character.table';
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
    'publisherId',
    'realName',
];

@Injectable({ providedIn: 'root' })
export class CharactersApiService {
    private electron = inject(ElectronService);
    private electronThing: any = (window as any)['electron'];
    private charQuery = new QueryGenerator(CharacterTable);

    public async SelectAll() {
        return await this.electronThing.charSelectAll();
    }

    public async fetchCharacters(): Promise<Character[]> {
        const tmp = await this.SelectAll();
        console.log('TEST 1', tmp);

        const stmt = this.charQuery.select('*', undefined, 'name');
        const results = await this.electron.sqlSelectAll<CharacterDto>(stmt);
        return results.map((o) => this.mapCharacterDto(o));
    }

    public async deleteCharacter(characterId: number) {
        const stmt = this.charQuery.delete({ id: characterId });
        await this.electron.sqlRun(stmt);
    }

    public async searchCharacters(search: string): Promise<number[]> {
        // const stmt = this.charQuery.select(
        //     'id',
        //     { name: `%${search}%` },
        //     'name',
        // );
        // const results = await this.electron.sqlSelectAll<{ id: number }>(stmt);
        const results = (await this.electronThing.charSearch(search)) as {
            id: number;
        }[];
        return results.map((o) => o.id);
    }

    public async selectByBook(bookId: number): Promise<number[]> {
        const sql = `SELECT characterId FROM BookCharacter where bookId = ?`;
        const results = await this.electron.sqlSelectAll<{
            characterId: number;
        }>(sql, bookId);
        return results.map((o) => o.characterId);
    }

    public async selectByTeam(teamId: number): Promise<number[]> {
        const sql = `SELECT characterId FROM TeamCharacter where teamId = ?`;
        const results = await this.electron.sqlSelectAll<{
            characterId: number;
        }>(sql, teamId);
        return results.map((o) => o.characterId);
    }

    public async fetchCharacter(id: number): Promise<Character> {
        const sql = `SELECT * FROM character where id = ?`;
        const character = await this.electron.sqlSelect<CharacterDto>(sql, id);

        if (!character) {
            throw new Error(`Character with id ${id} not found`);
        }
        return this.mapCharacterDto(character);
    }

    public async updateCharacter(
        id: number,
        character: Partial<Character>,
        _teamIds: number[],
    ) {
        if (character.image) {
            const buffer = await character.image!.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);
            character.image = uint8Array as any;
        }

        return await this.electronThing.charUpdate(id, character);
        // const fields = Object.keys(character).filter((v) => v !== 'id');

        // const sqlValueSets = fields.map((field) => `${field} = @${field}`);
        // const sql = `UPDATE character SET ${sqlValueSets.join(
        //     ',',
        // )} WHERE id = @id`;

        // const params = createSqlParams({ ...character, id });

        // await this.electron.sqlRun(sql, params);
        // await this.addCharacterTeamLinks(id, teamIds);
    }

    public async updateCharacterOld(
        id: number,
        character: Partial<Character>,
        teamIds: number[],
    ) {
        const fields = Object.keys(character).filter((v) => v !== 'id');

        const sqlValueSets = fields.map((field) => `${field} = @${field}`);
        const sql = `UPDATE character SET ${sqlValueSets.join(
            ',',
        )} WHERE id = @id`;

        const params = createSqlParams({ ...character, id });

        await this.electron.sqlRun(sql, params);
        await this.addCharacterTeamLinks(id, teamIds);
    }

    public async insertCharacter(character: Omit<Character, 'id'>) {
        const fields = Object.keys(character);

        const columnProps = fields.map((c) => `@${c}`);
        const sql = `INSERT INTO character (${fields.join(
            ', ',
        )}) VALUES (${columnProps.join(', ')})`;

        const params = createSqlParams(character);
        const id = await this.electron.sqlRun(sql, params);
        return await this.fetchCharacter(id);
    }

    private async addCharacterTeamLinks(
        characterId: number,
        teamIds: number[],
    ) {
        const characterInserts = teamIds.map<SqlStatement>((teamId) => ({
            sql: `INSERT INTO TeamCharacter(teamId, characterId) VALUES(?,?)`,
            args: [teamId, characterId],
        }));

        const deleteExistingCharacterLinks: SqlStatement = {
            sql: 'DELETE FROM TeamCharacter WHERE characterId = ?',
            args: [characterId],
        };

        await this.electron.sqlTransact([
            deleteExistingCharacterLinks,
            ...characterInserts,
        ]);
    }

    private mapCharacterDto(dto: CharacterDto): Character {
        return {
            id: dto.id,
            name: dto.name,
            aliases: dto.aliases,
            creators: dto.creators,
            description: dto.description,
            gender: this.getGender(dto.gender),
            origin: dto.origin,
            powers: dto.powers,
            publisherId: dto.publisherId,
            realName: dto.realName,
            summary: dto.summary,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            dateAdded: new Date(dto.dateAdded),
            externalUrl: dto.externalUrl,
            externalId: dto.externalId,
            image: dto.image
                ? new Blob([new Uint8Array(dto.image)], { type: 'image/jpeg' })
                : undefined,
        };
    }

    private getGender(val: number | null | undefined) {
        switch (val) {
            case 1:
                return Gender.Male;
            case 2:
                return Gender.Female;
            case null:
            case undefined:
                return undefined;
            default:
                return Gender.Other;
        }
    }
}

function createSqlParams(obj: Dictionary): { [key: string]: any } {
    return Object.keys(obj).reduce(
        (acc, key) => ({ ...acc, [`@${key}`]: obj[key] }),
        {},
    );
}
