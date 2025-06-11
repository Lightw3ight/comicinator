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
import { TeamsStore } from '../../core/store/teams/teams.store';
import { StreamingThumbListComponent } from '../../shared/streaming-thumb-list/streaming-thumb-list.component';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { TeamListItemComponent } from '../team-list-item/team-list-item.component';

@Component({
    selector: 'cbx-main-team-list',
    templateUrl: 'main-team-list.component.html',
    styleUrl: 'main-team-list.component.scss',
    imports: [
        StreamingThumbListComponent,
        ThumbListItemTemplateDirective,
        TeamListItemComponent,
        RouterLink,
    ],
})
export class MainTeamListComponent {
    private teamStore = inject(TeamsStore);

    public readonly search = input<string>();

    protected readonly pagedData$ = toObservable(this.teamStore.pagedData);
    protected readonly dataSource = signal<
        ThumbnailDataSource<number> | undefined
    >(undefined);
    private readonly columnCount = signal(0);

    constructor() {
        effect(async () => {
            const search = this.search();
            const columnCount = this.columnCount();
            this.teamStore.sortField();
            this.teamStore.sortDirection();

            untracked(async () => {
                if (columnCount > 0) {
                    this.teamStore.setColumnCount(columnCount);

                    if (search?.length) {
                        this.teamStore.setSearch(search);
                    } else {
                        this.teamStore.clearSearch();
                    }
                    await this.teamStore.resetPageData();

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
            this.teamStore.loadPage(pageIndex),
        );
    }
}
