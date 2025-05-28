import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { CharactersStore } from '../core/store/characters/characters.store';
import { IconButtonComponent } from '../shared/icon-button/icon-button.component';
import { CharacterListComponent } from './character-list/character-list.component';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { QuickFilterComponent } from '../shared/quick-filter/quick-filter.component';

@Component({
    selector: 'cbx-characters',
    templateUrl: 'characters.component.html',
    styleUrl: 'characters.component.scss',
    imports: [
        CharacterListComponent,
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
        QuickFilterComponent,
    ],
})
export class CharactersComponent {
    private charactersStore = inject(CharactersStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected readonly characters = this.charactersStore.displayItems;
    protected readonly quickSearch = this.charactersStore.quickSearch;
    protected readonly search = this.getSearchFromQuerystring();
    protected searchTitle = this.computeSearchTitle();

    constructor() {
        effect(async () => {
            const search = this.search();
            window.scrollTo(0, 0);

            if (search?.length) {
                await this.charactersStore.setActiveSearch(search);
            } else {
                this.charactersStore.clearSearch();
                this.charactersStore.runQuickSearch(
                    this.charactersStore.quickSearch(),
                );
            }
        });
    }

    protected clearSearch() {
        this.router.navigateByUrl('/characters');
    }

    protected computeSearchTitle() {
        return computed(() => {
            return `Search Results: ${this.search()}`;
        });
    }

    protected async setQuickSearch(filter: string) {
        await this.charactersStore.runQuickSearch(filter);
    }

    private getSearchFromQuerystring() {
        return toSignal(
            this.route.queryParamMap.pipe(
                map((pMap) => pMap.get('search') ?? undefined),
            ),
        );
    }
}
