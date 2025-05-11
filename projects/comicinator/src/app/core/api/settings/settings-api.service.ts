import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { SettingDto } from './dto/setting-dto.interface';
import { SqlStatement } from '../../models/sql-statement.interface';
import { AppSettings } from '../../models/app-settings.interface';

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
    private electron = inject(ElectronService);

    public async fetchSettings(): Promise<AppSettings> {
        const sql = `SELECT * FROM settings`;
        const results = await this.electron.sqlSelectAll<SettingDto>(sql);
        return results.reduce<AppSettings>(
            (acc, item) => ({ ...acc, [item.key]: item.value }),
            {} as AppSettings
        );
    }

    public async saveSettings(settings: Partial<AppSettings>) {
        const entries = Object.entries(settings);

        const inserts = entries.map<SqlStatement>(([key, value]) => ({
            sql: `INSERT INTO settings(key, value) VALUES(?, ?);`,
            args: [key, value],
        }));

        const deleteStmt: SqlStatement = {
            sql: `DELETE FROM settings WHERE key IN (${entries.map(
                () => '?'
            )});`,
            args: entries.map(([key]) => key)
        };

        await this.electron.sqlTransact([deleteStmt, ...inserts]);
        return;
    }
}
