import { Component, computed, effect, inject } from '@angular/core';
import { LocationsStore } from '../core/store/locations/locations.store';
import { LocationListComponent } from './location-list/location-list.component';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
    selector: 'cbx-locations',
    templateUrl: 'locations.component.html',
    styleUrl: 'locations.component.scss',
    imports: [
        LocationListComponent,
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
    ],
})
export class LocationsComponent {
    private locationsStore = inject(LocationsStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected locations = this.locationsStore.pageView;
    protected searchValue = toSignal(
        this.route.queryParamMap.pipe(map((pMap) => pMap.get('search'))),
    );
    protected searchTitle = this.computeSearchTitle();

    constructor() {
        effect(() => {
            const search = this.searchValue();
            window.scrollTo(0, 0);

            if (search?.length) {
                this.locationsStore.search(search);
            } else {
                this.locationsStore.clearSearch();
            }
        });
    }

    protected clearSearch() {
        this.router.navigateByUrl('/locations');
    }

    protected computeSearchTitle() {
        return computed(() => {
            return `Search Results: ${this.searchValue()}`;
        });
    }
}
