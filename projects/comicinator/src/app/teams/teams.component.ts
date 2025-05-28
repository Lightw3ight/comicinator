import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { TeamsStore } from '../core/store/teams/teams.store';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { TeamListComponent } from './team-list/team-list.component';
import { QuickFilterComponent } from '../shared/quick-filter/quick-filter.component';

@Component({
    selector: 'cbx-teams',
    templateUrl: 'teams.component.html',
    styleUrl: 'teams.component.scss',
    imports: [
        TeamListComponent,
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
        QuickFilterComponent,
    ],
})
export class TeamsComponent {
    private teamsStore = inject(TeamsStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected readonly teams = this.teamsStore.displayItems;
    protected readonly quickSearch = this.teamsStore.quickSearch;
    protected readonly search = this.getSearchFromQuerystring();

    protected searchTitle = this.computeSearchTitle();

    constructor() {
        effect(async () => {
            const search = this.search();
            window.scrollTo(0, 0);

            if (search?.length) {
                await this.teamsStore.setActiveSearch(search);
            } else {
                this.teamsStore.clearSearch();
                this.teamsStore.runQuickSearch(this.teamsStore.quickSearch());
            }
        });
    }

    protected clearSearch() {
        this.router.navigateByUrl('/teams');
    }

    protected async setQuickSearch(filter: string) {
        await this.teamsStore.runQuickSearch(filter);
    }

    private computeSearchTitle() {
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
