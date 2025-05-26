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

@Component({
    selector: 'cbx-characters',
    templateUrl: 'characters.component.html',
    styleUrl: 'characters.component.scss',
    imports: [
        CharacterListComponent,
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
    ],
})
export class CharactersComponent {
    private charactersStore = inject(CharactersStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected characters = this.charactersStore.pageView;
    protected searchValue = toSignal(
        this.route.queryParamMap.pipe(map((pMap) => pMap.get('search'))),
    );
    protected searchTitle = this.computeSearchTitle();

    constructor() {
        effect(() => {
            const search = this.searchValue();
            window.scrollTo(0, 0);

            if (search?.length) {
                this.charactersStore.search(search);
            } else {
                this.charactersStore.clearSearch();
            }
        });
    }

    protected clearSearch() {
        this.router.navigateByUrl('/characters');
    }

    protected computeSearchTitle() {
        return computed(() => {
            return `Search Results: ${this.searchValue()}`;
        });
    }
}
