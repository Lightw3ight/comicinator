import { Component, computed, effect, inject } from '@angular/core';
import { LocationsStore } from '../core/store/locations/locations.store';
import { LocationListComponent } from './location-list/location-list.component';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { QuickFilterComponent } from '../shared/quick-filter/quick-filter.component';

@Component({
    selector: 'cbx-locations',
    templateUrl: 'locations.component.html',
    styleUrl: 'locations.component.scss',
    imports: [
        LocationListComponent,
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
        QuickFilterComponent,
    ],
})
export class LocationsComponent {
    private locationsStore = inject(LocationsStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected readonly locations = this.locationsStore.displayItems;
    protected readonly quickSearch = this.locationsStore.quickSearch;
    protected readonly search = this.getSearchFromQuerystring();
    protected searchTitle = this.computeSearchTitle();

    constructor() {
        effect(async () => {
            const search = this.search();
            window.scrollTo(0, 0);

            if (search?.length) {
                await this.locationsStore.setActiveSearch(search);
            } else {
                this.locationsStore.clearSearch();
                this.locationsStore.runQuickSearch(
                    this.locationsStore.quickSearch(),
                );
            }
        });
    }

    protected clearSearch() {
        this.router.navigateByUrl('/locations');
    }

    protected async setQuickSearch(filter: string) {
        await this.locationsStore.runQuickSearch(filter);
    }

    protected computeSearchTitle() {
        return computed(() => {
            return `Search Results: ${this.search()}`;
        });
    }

    private getSearchFromQuerystring() {
        return toSignal(
            this.route.queryParamMap.pipe(
                map((pMap) => pMap.get('search') ?? undefined),
            ),
        );
    }
}
