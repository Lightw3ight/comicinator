import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { ComicVineService } from '../../../core/api/comic-vine/comic-vine-api.service';

import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';

import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TeamResult } from '../../../core/api/comic-vine/models/team-result.interface';
import { TeamSearchItem } from './team-search-item.interface';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'cbx-team-search-results',
    templateUrl: 'team-search-results.component.html',
    styleUrl: 'team-search-results.component.scss',
    imports: [
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatDialogTitle,
        MatTableModule,
        MatButton,
        MatSortModule,
        MatProgressBar,
        MatCheckbox,
    ],
})
export class TeamSearchResultsComponent {
    private comicVineService = inject(ComicVineService);
    private dialogRef = inject(MatDialogRef<TeamSearchResultsComponent>);

    protected displayedColumns = ['name', 'publisher', 'memberCount'];
    protected initialSearch = inject<string>(MAT_DIALOG_DATA);
    protected results = signal<MatTableDataSource<TeamSearchItem>>(
        new MatTableDataSource<TeamSearchItem>([]),
    );
    protected loading = signal(true);
    protected selectedItem = signal<TeamResult | undefined>(undefined);
    private sort = viewChild(MatSort);
    protected preparingData = signal(false);
    protected importTeamMembers = signal(false);

    constructor() {
        effect(async () => {
            const sort = this.sort();
            if (sort) {
                await this.search(this.initialSearch);
            }
        });
    }

    protected async selectCurrent() {
        const id = this.selectedItem()?.id;

        if (id != null) {
            this.preparingData.set(true);
            try {
                const apiResult = await this.comicVineService.getTeam(
                    this.selectedItem()!.id,
                );
                this.dialogRef.close({
                    result: apiResult,
                    importMembers: this.importTeamMembers(),
                });
            } catch {
                this.preparingData.set(false);
                this.dialogRef.close();
            }
        }
    }

    private async search(search: string) {
        this.loading.set(true);
        const results = await this.comicVineService.searchTeams(search);
        const searchItems = results.map<TeamSearchItem>((o) => ({
            name: o.name,
            publisher: o.publisher?.name,
            data: o,
            memberCount: o.memberCount,
        }));

        const selection =
            searchItems.find(
                (o) =>
                    o.name.toLocaleLowerCase() === search.toLocaleLowerCase(),
            ) ?? searchItems[0];

        this.selectedItem.set(selection?.data);
        this.results.set(new MatTableDataSource(searchItems));
        this.results().sort = this.sort()!;
        this.loading.set(false);
    }
}
