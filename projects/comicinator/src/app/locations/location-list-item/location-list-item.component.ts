import {
    Component,
    computed,
    effect,
    inject,
    input,
    signal,
    untracked,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '../../core/models/location.interface';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { LocationFormComponent } from '../location-form/location-form.component';

@Component({
    selector: 'cbx-location-list-item',
    templateUrl: 'location-list-item.component.html',
    styleUrl: 'location-list-item.component.scss',
    imports: [IconButtonComponent],
    host: {
        '[style.backgroundImage]': 'imageCssUrl()',
    },
})
export class LocationListItemComponent {
    public location = input.required<Location>();
    private dialog = inject(MatDialog);

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

    public onEditClick(args: MouseEvent) {
        args.stopPropagation();
        this.dialog.open(LocationFormComponent, {
            data: this.location(),
            minWidth: 700,
            disableClose: true,
        });
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
            return this.imageUrl() ? `url('${this.imageUrl()}')` : undefined;
        });
    }
}
