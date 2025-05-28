import { Component, computed, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Character } from '../../core/models/character.interface';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { CharacterFormComponent } from '../character-form/character-form.component';
import { firstValueFrom } from 'rxjs';
import { generateImageCssSrc } from '../../shared/generate-image-path';

@Component({
    selector: 'cbx-character-list-item',
    templateUrl: 'character-list-item.component.html',
    styleUrl: 'character-list-item.component.scss',
    imports: [IconButtonComponent],
    host: {
        '[style.backgroundImage]': 'imageCssUrl()',
    },
})
export class CharacterListItemComponent {
    public character = input.required<Character>();
    private dialog = inject(MatDialog);

    protected imageCssUrl = this.computeImageUrlSrc();
    private timeStamp = signal<Date | undefined>(undefined);

    public async onEditClick(args: MouseEvent) {
        args.stopPropagation();
        const ref = this.dialog.open(CharacterFormComponent, {
            data: this.character().id,
            minWidth: 700,
        });
        await firstValueFrom(ref.afterClosed());

        this.timeStamp.set(new Date());
    }

    private computeImageUrlSrc() {
        return computed(() => {
            return generateImageCssSrc(
                this.character().id,
                'char',
                this.timeStamp() ?? this.character().lastUpdated,
            );
        });
    }
}
