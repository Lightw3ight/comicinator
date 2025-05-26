import {
    Component,
    computed,
    effect,
    input,
    OnDestroy,
    output,
    signal,
    untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '../../../core/models/location.interface';

@Component({
    selector: 'cbx-location-selector-item',
    templateUrl: 'location-selector-item.component.html',
    styleUrl: 'location-selector-item.component.scss',
    imports: [MatButtonModule, MatIconModule],
})
export class LocationSelectorItemComponent implements OnDestroy {
    public location = input.required<Location>();

    public remove = output();
    protected imageUrl = signal<string | undefined>(undefined);
    protected imageCssUrl = this.computeImageUrlSrc();

    constructor() {
        effect(() => {
            const location = this.location();

            untracked(() => {
                this.setImage(location.image);
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
