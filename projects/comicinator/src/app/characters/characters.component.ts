import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Character } from '../core/models/character.interface';
import { CharactersStore } from '../core/store/characters/characters.store';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { SortConfig } from '../shared/sort-selector/sort-config.interface';
import { SortItemComponent } from '../shared/sort-selector/sort-item/sort-item.component';
import { SortSelectorComponent } from '../shared/sort-selector/sort-selector.component';
import { MainCharacterListComponent } from './main-character-list/main-character-list.component';

@Component({
    selector: 'cbx-characters',
    templateUrl: 'characters.component.html',
    styleUrl: 'characters.component.scss',
    imports: [
        // CharacterListComponent,
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
        MainCharacterListComponent,
        SortSelectorComponent,
        SortItemComponent,
    ],
})
export class CharactersComponent {
    private characterStore = inject(CharactersStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected readonly search = this.getSearchFromQuerystring();
    protected readonly pageTitle = this.computePageTitle();
    protected readonly sortConfig = this.computeSortConfig();

    protected clearSearch() {
        this.router.navigateByUrl('/characters', { replaceUrl: true });
    }

    protected setSorting(sorting: SortConfig) {
        this.characterStore.setSorting(
            sorting.field as keyof Character,
            sorting.dir,
        );
    }

    private computePageTitle() {
        return computed(() => {
            return this.search()
                ? `Search Results: ${this.search()}`
                : 'Characters';
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
                field: this.characterStore.sortField(),
                dir: this.characterStore.sortDirection(),
            };
        });
    }
}
