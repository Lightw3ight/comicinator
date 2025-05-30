import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Team } from '../core/models/team.interface';
import { TeamsStore } from '../core/store/teams/teams.store';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { SortConfig } from '../shared/sort-selector/sort-config.interface';
import { SortItemComponent } from '../shared/sort-selector/sort-item/sort-item.component';
import { SortSelectorComponent } from '../shared/sort-selector/sort-selector.component';
import { MainTeamListComponent } from './main-team-list/main-team-list.component';

@Component({
    selector: 'cbx-teams',
    templateUrl: 'teams.component.html',
    styleUrl: 'teams.component.scss',
    imports: [
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
        MainTeamListComponent,
        SortSelectorComponent,
        SortItemComponent,
    ],
})
export class TeamsComponent {
    private teamsStore = inject(TeamsStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected readonly search = this.getSearchFromQuerystring();
    protected readonly pageTitle = this.computePageTitle();
    protected readonly sortConfig = this.computeSortConfig();

    protected clearSearch() {
        this.router.navigateByUrl('/teams', { replaceUrl: true });
    }

    protected setSorting(sorting: SortConfig) {
        this.teamsStore.setSorting(sorting.field as keyof Team, sorting.dir);
    }

    private computePageTitle() {
        return computed(() => {
            return this.search() ? `Search Results: ${this.search()}` : 'Teams';
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
                field: this.teamsStore.sortField(),
                dir: this.teamsStore.sortDirection(),
            };
        });
    }
}
