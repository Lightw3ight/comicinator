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

import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LocationResult } from '../../../core/api/comic-vine/models/location-result.interface';
import { LocationSearchItem } from './location-search-item.interface';

@Component({
    selector: 'cbx-location-search-results',
    templateUrl: 'location-search-results.component.html',
    styleUrl: 'location-search-results.component.scss',
    imports: [
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatDialogTitle,
        MatTableModule,
        MatButton,
        MatSortModule,
        MatProgressBar,
        CdkDrag,
    ],
})
export class LocationSearchResultsComponent {
    private comicVineService = inject(ComicVineService);
    private dialogRef = inject(MatDialogRef<LocationSearchResultsComponent>);

    protected displayedColumns = ['name'];
    protected initialSearch = inject<string>(MAT_DIALOG_DATA);
    protected results = signal<MatTableDataSource<LocationSearchItem>>(
        new MatTableDataSource<LocationSearchItem>([]),
    );
    protected loading = signal(true);
    protected selectedItem = signal<LocationResult | undefined>(undefined);
    private sort = viewChild(MatSort);
    protected preparingData = signal(false);

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
                const apiResult = await this.comicVineService.getLocation(
                    this.selectedItem()!.id,
                );
                this.dialogRef.close(apiResult);
            } catch {
                this.preparingData.set(false);
            }
        }
    }

    private async search(search: string) {
        this.loading.set(true);
        const results = await this.comicVineService.searchLocations(search);
        const searchItems = results.map<LocationSearchItem>((o) => ({
            name: o.name,
            data: o,
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
