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
import { generateImageCssSrc } from '../../generate-image-path';

@Component({
    selector: 'cbx-location-selector-item',
    templateUrl: 'location-selector-item.component.html',
    styleUrl: 'location-selector-item.component.scss',
    imports: [MatButtonModule, MatIconModule],
})
export class LocationSelectorItemComponent {
    public location = input.required<Location>();

    public remove = output();
    protected imageCssUrl = this.computeImageUrlSrc();

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
