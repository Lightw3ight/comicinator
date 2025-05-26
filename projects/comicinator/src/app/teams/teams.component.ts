import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { TeamsStore } from '../core/store/teams/teams.store';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { TeamListComponent } from './team-list/team-list.component';

@Component({
    selector: 'cbx-teams',
    templateUrl: 'teams.component.html',
    styleUrl: 'teams.component.scss',
    imports: [TeamListComponent, PageHeaderComponent, MatIcon, MatIconButton],
})
export class TeamsComponent {
    private teamsStore = inject(TeamsStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected teams = this.teamsStore.pageView;
    protected searchValue = toSignal(
        this.route.queryParamMap.pipe(map((pMap) => pMap.get('search'))),
    );
    protected searchTitle = this.computeSearchTitle();

    constructor() {
        effect(() => {
            const search = this.searchValue();
            window.scrollTo(0, 0);

            if (search?.length) {
                this.teamsStore.search(search);
            } else {
                this.teamsStore.clearSearch();
            }
        });
    }

    protected clearSearch() {
        this.router.navigateByUrl('/teams');
    }

    protected computeSearchTitle() {
        return computed(() => {
            return `Search Results: ${this.searchValue()}`;
        });
    }
}
