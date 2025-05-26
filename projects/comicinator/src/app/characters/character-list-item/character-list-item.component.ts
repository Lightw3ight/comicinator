import { Component, computed, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Character } from '../../core/models/character.interface';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { CharacterFormComponent } from '../character-form/character-form.component';
import { firstValueFrom } from 'rxjs';

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

    // protected imageUrl = signal<string | undefined>(undefined);
    protected imageCssUrl = this.computeImageUrlSrc();
    private timeStamp = signal<number | undefined>(undefined);

    // constructor() {
    //     effect(() => {
    //         const char = this.character();

    //         untracked(() => {
    //             this.setImage(char.image);
    //         });
    //     });
    // }

    // public ngOnDestroy(): void {
    //     this.disposeImage();
    // }

    public async onEditClick(args: MouseEvent) {
        args.stopPropagation();
        const ref = this.dialog.open(CharacterFormComponent, {
            data: this.character().id,
            minWidth: 700,
        });
        await firstValueFrom(ref.afterClosed());

        const stamp = new Date().getTime();
        this.timeStamp.set(stamp);
    }

    // private setImage(image: Blob | undefined) {
    //     this.disposeImage();

    //     if (image && typeof image !== 'string') {
    //         const url = URL.createObjectURL(image);
    //         this.imageUrl.set(url);
    //     }
    // }

    // private disposeImage() {
    //     const url = this.imageUrl();
    //     if (url) {
    //         URL.revokeObjectURL(url);
    //     }
    // }

    private computeImageUrlSrc() {
        return computed(() => {
            const ts = this.timeStamp();
            const qs = ts ? `?${ts}` : '';
            return `url("char-img://${this.character().id}${qs}")`;
        });
    }
}
