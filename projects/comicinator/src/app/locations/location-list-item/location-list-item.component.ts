import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '../../core/models/location.interface';
import { generateImageCssSrc } from '../../shared/generate-image-path';
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

    protected imageCssUrl = this.computeImageUrlSrc();

    public onEditClick(args: MouseEvent) {
        args.stopPropagation();
        this.dialog.open(LocationFormComponent, {
            data: this.location(),
            minWidth: 700,
            disableClose: true,
        });
    }

    private computeImageUrlSrc() {
        return computed(() => {
            return generateImageCssSrc(
                this.location().id,
                'loc',
                this.location().lastUpdated,
            );
        });
    }
}
