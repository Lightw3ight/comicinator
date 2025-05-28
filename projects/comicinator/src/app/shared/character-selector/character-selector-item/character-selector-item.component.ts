import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Character } from '../../../core/models/character.interface';
import { generateImageCssSrc } from '../../generate-image-path';

@Component({
    selector: 'cbx-character-selector-item',
    templateUrl: 'character-selector-item.component.html',
    styleUrl: 'character-selector-item.component.scss',
    imports: [MatButtonModule, MatIconModule],
})
export class CharacterSelectorItemComponent {
    public character = input.required<Character>();
    public remove = output();

    protected imageCssUrl = this.computeImageUrlSrc();

    private computeImageUrlSrc() {
        return computed(() => {
            return generateImageCssSrc(
                this.character().id,
                'char',
                this.character().lastUpdated,
            );
        });
    }
}
