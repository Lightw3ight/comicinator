import {
    Component,
    effect,
    input,
    OnDestroy,
    signal,
    untracked,
} from '@angular/core';
import { Character } from '../../core/models/character.interface';

@Component({
    selector: 'cbx-character-list-item',
    templateUrl: 'character-list-item.component.html',
    styleUrl: 'character-list-item.component.scss',
    host: {
        '[style.backgroundImage]': 'imageUrl()',
    },
})
export class CharacterListItemComponent implements OnDestroy {
    public character = input.required<Character>();

    protected imageUrl = signal<string | undefined>(undefined);

    constructor() {
        effect(() => {
            const char = this.character();

            untracked(() => {
                this.setImage(char.image);
            });
        });
    }

    public ngOnDestroy(): void {
        this.disposeImage();
    }

    private setImage(image: Blob | undefined) {
        this.disposeImage();

        if (image && typeof image !== 'string') {
            const url = URL.createObjectURL(image);
            this.imageUrl.set(`url('${url}')`);
        }
    }

    private disposeImage() {
        const url = this.imageUrl();
        if (url) {
            URL.revokeObjectURL(url);
        }
    }
}
