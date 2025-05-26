import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Dictionary } from '../../models/dictionary.interface';
import { SqlStatement } from '../../models/sql-statement.interface';
import { Team } from '../../models/team.interface';
import { TeamDto } from './dtos/team-dto.interface';
import { QueryGenerator } from '../../sql/query-generator';
import { TeamCharacterTable } from './team-character-table';
import { BookTeam } from '../books/book-team.table';
import { TeamTable } from './team-table';

@Injectable({ providedIn: 'root' })
export class TeamsApiService {
    private electron = inject(ElectronService);
    private query = new QueryGenerator(TeamTable);
    private teamCharacterQuery = new QueryGenerator(TeamCharacterTable);
    private bookTeamQuery = new QueryGenerator(BookTeam);

    public async search(search: string): Promise<number[]> {
        const stmt = this.query.select('id', { name: `%${search}%` }, 'name');
        const results = await this.electron.sqlSelectAll<{ id: number }>(stmt);
        return results.map((o) => o.id);
    }

    public async fetchTeams(): Promise<Team[]> {
        const sql = `SELECT * FROM team`;
        const results = await this.electron.sqlSelectAll<TeamDto>(sql);
        return results.map((t) => this.mapToModel(t));
    }

    public async fetchTeam(id: number): Promise<Team> {
        const sql = `SELECT * FROM team where id = ?`;
        const team = await this.electron.sqlSelect<TeamDto>(sql, id);

        if (!team) {
            throw new Error(`Team with id ${id} not found`);
        }

        return this.mapToModel(team);
    }

    public async selectByCharacter(characterId: number): Promise<number[]> {
        const stmt = this.teamCharacterQuery.select(['teamId'], {
            characterId,
        });

        const results = await this.electron.sqlSelectAll<{
            teamId: number;
        }>(stmt);
        return results.map((o) => o.teamId);
    }

    public async selectByBook(bookId: number): Promise<number[]> {
        const stmt = this.bookTeamQuery.select(['teamId'], { bookId });

        const results = await this.electron.sqlSelectAll<{
            teamId: number;
        }>(stmt);
        return results.map((o) => o.teamId);
    }

    public async insertTeam(team: Omit<Team, 'id'>, characterIds: number[]) {
        const fields = Object.keys(team);

        const columnProps = fields.map((c) => `@${c}`);
        const sql = `INSERT INTO team (${fields.join(
            ', ',
        )}) VALUES (${columnProps.join(', ')})`;

        const params = createSqlParams(this.mapToDto(team as Team));
        const id = await this.electron.sqlRun(sql, params);
        await this.addTeamCharacterLinks(id, characterIds);
        return await this.fetchTeam(id);
    }

    public async updateTeam(
        id: number,
        team: Partial<Team>,
        characterIds: number[],
    ) {
        const fields = Object.keys(team).filter((v) => v !== 'id');

        const sqlValueSets = fields.map((field) => `${field} = @${field}`);
        const sql = `UPDATE Team SET ${sqlValueSets.join(',')} WHERE id = @id`;

        const params = createSqlParams({ ...team, id });

        await this.electron.sqlRun(sql, params);
        await this.addTeamCharacterLinks(id, characterIds);
    }

    private async addTeamCharacterLinks(
        teamId: number,
        characterIds: number[],
    ) {
        const characterInserts = characterIds.map<SqlStatement>((id) => ({
            sql: `INSERT INTO TeamCharacter(teamId, characterId) VALUES(?,?)`,
            args: [teamId, id],
        }));

        const deleteExistingCharacterLinks: SqlStatement = {
            sql: 'DELETE FROM TeamCharacter WHERE teamId = ?',
            args: [teamId],
        };

        await this.electron.sqlTransact([
            deleteExistingCharacterLinks,
            ...characterInserts,
        ]);
    }

    private mapToModel(dto: TeamDto): Team {
        const { image, dateAdded, ...rest } = dto;

        return {
            ...rest,
            dateAdded: new Date(dateAdded),
            image: image
                ? new Blob([new Uint8Array(image)], { type: 'image/jpeg' })
                : undefined,
        };
    }

    private mapToDto(model: Team): TeamDto {
        const { dateAdded, image, ...rest } = model;

        return {
            ...rest,
            dateAdded: dateAdded.toISOString(),
            image: image as any,
        };
    }
}

function createSqlParams(obj: Dictionary): { [key: string]: any } {
    return Object.keys(obj).reduce(
        (acc, key) => ({ ...acc, [`@${key}`]: obj[key] }),
        {},
    );
}
