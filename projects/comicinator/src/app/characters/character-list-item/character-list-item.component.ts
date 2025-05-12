import { Component, input } from '@angular/core';
import { Character } from '../../core/models/character.interface';

@Component({
    selector: 'cbx-character-list-item',
    templateUrl: 'character-list-item.component.html',
    styleUrl: 'character-list-item.component.scss'
})

export class CharacterListItemComponent {
    public character = input.required<Character>();
}