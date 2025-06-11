import { Component, input } from '@angular/core';
import { Character } from '../../core/models/character.interface';
import { CharacterListItemComponent } from '../character-list-item/character-list-item.component';
import { VirtualThumbListComponent } from '../../shared/virtual-thumb-list/virtual-thumb-list.component';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'cbx-character-list',
    templateUrl: 'character-list.component.html',
    styleUrl: 'character-list.component.scss',
    imports: [
        CharacterListItemComponent,
        VirtualThumbListComponent,
        ThumbListItemTemplateDirective,
        RouterLink,
    ],
})
export class CharacterListComponent {
    public characters = input.required<Character[]>();
}
