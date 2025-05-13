import { Component, effect, inject } from '@angular/core';
import { CharactersStore } from '../core/store/characters/characters.store';
import { ThumbListItemTemplateDirective } from '../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { VirtualThumbListComponent } from '../shared/virtual-thumb-list/virtual-thumb-list.component';
import { CharacterListItemComponent } from './character-list-item/character-list-item.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconButtonComponent } from '../shared/icon-button/icon-button.component';

@Component({
    selector: 'cbx-characters',
    templateUrl: 'characters.component.html',
    styleUrl: 'characters.component.scss',
    imports: [
        CharacterListItemComponent,
        VirtualThumbListComponent,
        ThumbListItemTemplateDirective,
        RouterLink,
        IconButtonComponent,
    ],
})
export class CharactersComponent {
    private charactersStore = inject(CharactersStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    protected characters = this.charactersStore.pageView;
    protected searchValue = toSignal(
        this.route.queryParamMap.pipe(map((pMap) => pMap.get('search')))
    );

    constructor() {
        effect(() => {
            const search = this.searchValue();

            window.scrollTo(0, 0);

            if (search?.length) {
                console.log('search', search);
                this.charactersStore.searchSharacters(search);
            } else {
                this.charactersStore.clearSearch();
            }
        });
    }

    protected clearSearch() {
        this.router.navigateByUrl('/characters');
    }
}
