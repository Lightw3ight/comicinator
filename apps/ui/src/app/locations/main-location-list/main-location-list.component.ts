import {
    Component,
    effect,
    inject,
    input,
    signal,
    untracked,
} from '@angular/core';

import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ThumbnailDataSource } from '../../books/thumbnail-data-source';
import { LocationsStore } from '../../core/store/locations/locations.store';
import { StreamingThumbListComponent } from '../../shared/streaming-thumb-list/streaming-thumb-list.component';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { LocationListItemComponent } from '../location-list-item/location-list-item.component';

@Component({
    selector: 'cbx-main-location-list',
    templateUrl: 'main-location-list.component.html',
    styleUrl: 'main-location-list.component.scss',
    imports: [
        StreamingThumbListComponent,
        ThumbListItemTemplateDirective,
        LocationListItemComponent,
        RouterLink,
    ],
})
export class MainLocationListComponent {
    private locationStore = inject(LocationsStore);

    public readonly search = input<string>();

    protected readonly pagedData$ = toObservable(this.locationStore.pagedData);
    protected readonly dataSource = signal<
        ThumbnailDataSource<number> | undefined
    >(undefined);
    private readonly columnCount = signal(0);

    constructor() {
        effect(async () => {
            const search = this.search();
            const columnCount = this.columnCount();
            this.locationStore.sortField();
            this.locationStore.sortDirection();

            untracked(async () => {
                if (columnCount > 0) {
                    this.locationStore.setColumnCount(columnCount);

                    if (search?.length) {
                        this.locationStore.setSearch(search);
                    } else {
                        this.locationStore.clearSearch();
                    }
                    await this.locationStore.resetPageData();

                    this.reloadDataSource();
                }
            });
        });
    }

    protected async onColumnCountChange(count: number) {
        this.columnCount.set(count);
    }

    private reloadDataSource() {
        if (this.dataSource()) {
            this.dataSource.set(undefined);
        }

        setTimeout(() => this.dataSource.set(this.createDataSource()));
    }

    private createDataSource() {
        return new ThumbnailDataSource(this.pagedData$, (pageIndex) =>
            this.locationStore.loadPage(pageIndex),
        );
    }
}
