import {
    Component,
    computed,
    effect,
    input,
    OnDestroy,
    OnInit,
    output,
    signal,
    untracked,
} from '@angular/core';
import { Character } from '../../../core/models/character.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'cbx-character-selector-item',
    templateUrl: 'character-selector-item.component.html',
    styleUrl: 'character-selector-item.component.scss',
    imports: [MatButtonModule, MatIconModule],
})
export class CharacterSelectorItemComponent implements OnDestroy {
    public character = input.required<Character>();

    public remove = output();
    protected imageUrl = signal<string | undefined>(undefined);
    protected imageCssUrl = this.computeImageUrlSrc();

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
            this.imageUrl.set(url);
        }
    }

    private disposeImage() {
        const url = this.imageUrl();
        if (url) {
            URL.revokeObjectURL(url);
        }
    }

    private computeImageUrlSrc() {
        return computed(() => {
            return `url('${this.imageUrl()}')`;
        });
    }
}
