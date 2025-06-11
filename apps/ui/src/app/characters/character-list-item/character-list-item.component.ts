import { Component, computed, inject, input, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { Character } from '../../core/models/character.interface';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { generateImageCssSrc } from '../../shared/generate-image-path';
import { ThumbActionsComponent } from '../../shared/thumb-actions/thumb-actions.component';
import { CharacterFormComponent } from '../character-form/character-form.component';

@Component({
    selector: 'cbx-character-list-item',
    templateUrl: 'character-list-item.component.html',
    styleUrl: 'character-list-item.component.scss',
    imports: [MatIcon, MatIconButton, ThumbActionsComponent],
    host: {
        '[style.backgroundImage]': 'imageCssUrl()',
    },
})
export class CharacterListItemComponent {
    private characterStore = inject(CharactersStore);
    private dialog = inject(MatDialog);

    public readonly character = input<Character>();
    public readonly characterId = input<number>();

    protected imageCssUrl = this.computeImageUrlSrc();
    protected characterData = this.computeCharacterData();
    private timeStamp = signal<Date | undefined>(undefined);

    public async onEditClick(args: MouseEvent) {
        args.stopPropagation();
        const ref = this.dialog.open(CharacterFormComponent, {
            data: this.characterData().id,
            minWidth: 700,
        });
        await firstValueFrom(ref.afterClosed());

        this.timeStamp.set(new Date());
    }

    private computeImageUrlSrc() {
        return computed(() => {
            return generateImageCssSrc(
                this.characterData().id,
                'char',
                this.timeStamp() ?? this.characterData().lastUpdated
            );
        });
    }

    private computeCharacterData() {
        return computed(() => {
            return (
                this.character() ??
                this.characterStore.entityMap()[this.characterId()!]
            );
        });
    }
}
