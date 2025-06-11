import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Location } from '../core/models/location.interface';
import { LocationsStore } from '../core/store/locations/locations.store';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { SortConfig } from '../shared/sort-selector/sort-config.interface';
import { SortItemComponent } from '../shared/sort-selector/sort-item/sort-item.component';
import { SortSelectorComponent } from '../shared/sort-selector/sort-selector.component';
import { MainLocationListComponent } from './main-location-list/main-location-list.component';

@Component({
    selector: 'cbx-locations',
    templateUrl: 'locations.component.html',
    styleUrl: 'locations.component.scss',
    imports: [
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
        MainLocationListComponent,
        SortSelectorComponent,
        SortItemComponent,
    ],
})
export class LocationsComponent {
    private locationsStore = inject(LocationsStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected readonly search = this.getSearchFromQuerystring();
    protected readonly pageTitle = this.computePageTitle();
    protected readonly sortConfig = this.computeSortConfig();

    protected clearSearch() {
        this.router.navigateByUrl('/locations', { replaceUrl: true });
    }

    protected setSorting(sorting: SortConfig) {
        this.locationsStore.setSorting(
            sorting.field as keyof Location,
            sorting.dir,
        );
    }

    private computePageTitle() {
        return computed(() => {
            return this.search()
                ? `Search Results: ${this.search()}`
                : 'Locations';
        });
    }

    private getSearchFromQuerystring() {
        return toSignal(
            this.route.queryParamMap.pipe(
                map((pMap) => pMap.get('search') ?? undefined),
            ),
        );
    }

    private computeSortConfig(): Signal<SortConfig> {
        return computed(() => {
            return {
                field: this.locationsStore.sortField(),
                dir: this.locationsStore.sortDirection(),
            };
        });
    }
}
