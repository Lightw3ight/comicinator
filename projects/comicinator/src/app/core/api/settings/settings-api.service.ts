import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { SettingDto } from './dto/setting-dto.interface';
import { SqlStatement } from '../../models/sql-statement.interface';
import { AppSettings } from '../../models/app-settings.interface';

interface Setting {
    key: string;
    value: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
    private electron = inject(ElectronService);

    public async selectAll(): Promise<AppSettings> {
        const settings = await this.electron.run<Setting[]>('settingSelectAll');

        return settings.reduce<AppSettings>(
            (acc, item) => ({ ...acc, [item.key]: item.value }),
            {} as AppSettings,
        );
    }

    // public async fetchSettings(): Promise<AppSettings> {
    //     const sql = `SELECT * FROM settings`;
    //     const results = await this.electron.sqlSelectAll<SettingDto>(sql);
    //     return results.reduce<AppSettings>(
    //         (acc, item) => ({ ...acc, [item.key]: item.value }),
    //         {} as AppSettings,
    //     );
    // }

    public async saveSettings(settings: Partial<AppSettings>) {
        const toSave = Object.entries(settings).map<Setting>(
            ([key, value]) => ({ key, value }),
        );

        await this.electron.run<Setting[]>('settingSaveAll', toSave);
    }
}
