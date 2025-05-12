import { Component, inject } from '@angular/core';
import { CharactersStore } from '../core/store/characters/characters.store';
import { ThumbListItemTemplateDirective } from '../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { VirtualThumbListComponent } from '../shared/virtual-thumb-list/virtual-thumb-list.component';
import { CharacterListItemComponent } from './character-list-item/character-list-item.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'cbx-characters',
    templateUrl: 'characters.component.html',
    styleUrl: 'characters.component.scss',
    imports: [
        CharacterListItemComponent,
        VirtualThumbListComponent,
        ThumbListItemTemplateDirective,
        RouterLink
    ],
})
export class CharactersComponent {
    private charactersStore = inject(CharactersStore);

    protected characters = this.charactersStore.entities;
}
