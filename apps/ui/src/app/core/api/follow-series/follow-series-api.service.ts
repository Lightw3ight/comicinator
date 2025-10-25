import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';

@Injectable({ providedIn: 'root' })
export class FollowSeriesApiService {
    private electron = inject(ElectronService);

    public async selectAll(): Promise<string[]> {
        return await this.electron.run<string[]>('seriesSelectAll');
    }

    public async followSeries(seriesName: string): Promise<void> {
        return await this.electron.run<void>('seriesFollowSeries', seriesName);
    }

    public async unfollowSeries(seriesName: string): Promise<void> {
        return await this.electron.run<void>(
            'seriesUnfollowSeries',
            seriesName,
        );
    }

    public async selectSeriesWithUnreadBooks(): Promise<string[]> {
        return await this.electron.run<string[]>(
            'seriesSelectSeriesWithUnreadBooks',
        );
    }
}
