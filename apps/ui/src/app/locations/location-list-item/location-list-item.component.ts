import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '../../core/models/location.interface';
import { generateImageCssSrc } from '../../shared/generate-image-path';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { LocationFormComponent } from '../location-form/location-form.component';
import { LocationsStore } from '../../core/store/locations/locations.store';

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
    private dialog = inject(MatDialog);
    private locationStore = inject(LocationsStore);

    public location = input<Location>();
    public readonly locationId = input<number>();

    protected readonly imageCssUrl = this.computeImageUrlSrc();
    protected readonly locationData = this.computeLocationData();

    public onEditClick(args: MouseEvent) {
        args.stopPropagation();
        this.dialog.open(LocationFormComponent, {
            data: this.locationData(),
            minWidth: 700,
            disableClose: true,
        });
    }

    private computeImageUrlSrc() {
        return computed(() => {
            return generateImageCssSrc(
                this.locationData().id,
                'loc',
                this.locationData().lastUpdated,
            );
        });
    }

    private computeLocationData() {
        return computed(() => {
            return (
                this.location() ??
                this.locationStore.entityMap()[this.locationId()!]
            );
        });
    }
}
