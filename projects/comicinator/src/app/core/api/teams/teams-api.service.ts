import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { Dictionary } from '../../models/dictionary.interface';
import { Team } from '../../models/team.interface';
import { TeamDto } from './dtos/team-dto.interface';

@Injectable({ providedIn: 'root' })
export class TeamsApiService {
    private electron = inject(ElectronService);

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

    public async insertTeam(team: Omit<Team, 'id'>) {
        const fields = Object.keys(team);
        
        const columnProps = fields.map((c) => `@${c}`);
        const sql = `INSERT INTO team (${fields.join(
            ', '
        )}) VALUES (${columnProps.join(', ')})`;

        const params = createSqlParams(this.mapToDto(team as Team));
        const id = await this.electron.sqlRun(sql, params);
        return await this.fetchTeam(id);
    }

    private mapToModel(dto: TeamDto): Team {
        const { dateAdded, ...rest } = dto;

        return {
            ...rest,
            dateAdded: new Date(dateAdded)
        }
    }

    private mapToDto(model: Team): TeamDto {
        const { dateAdded, ...rest } = model;

        return {
            ...rest,
            dateAdded: dateAdded.toISOString()
        }
    }
}

function createSqlParams(obj: Dictionary): { [key: string]: any } {
    return Object.keys(obj).reduce(
        (acc, key) => ({ ...acc, [`@${key}`]: obj[key] }),
        {}
    );
}
