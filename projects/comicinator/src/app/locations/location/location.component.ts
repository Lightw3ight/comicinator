import {
    Component,
    computed,
    effect,
    inject,
    input,
    numberAttribute,
    signal,
    untracked,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { BookListComponent } from '../../books/book-list/book-list.component';
import { generateImagePath } from '../../shared/generate-image-path';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { LocationFormComponent } from '../location-form/location-form.component';
import { LocationDetailsStore } from './store/location-details.store';

@Component({
    selector: 'cbx-location',
    templateUrl: 'location.component.html',
    styleUrl: 'location.component.scss',
    providers: [LocationDetailsStore],
    imports: [BookListComponent, MatTabsModule, IconButtonComponent],
})
export class LocationComponent {
    private locationDetailsStore = inject(LocationDetailsStore);

    public id = input.required({ transform: numberAttribute });

    protected location = this.locationDetailsStore.location;
    protected books = this.locationDetailsStore.books;
    protected activeTabIndex = signal(0);
    protected imageUrl = this.computeImageUrl();
    private dialog = inject(MatDialog);

    constructor() {
        effect(() => {
            const id = this.id();

            untracked(() => {
                this.locationDetailsStore.setActiveTeam(id);
            });
        });
    }

    public edit() {
        this.dialog.open(LocationFormComponent, {
            data: this.location(),
            minWidth: 700,
        });
    }

    private computeImageUrl() {
        return computed(() => {
            return generateImagePath(
                this.id(),
                'loc',
                this.location()?.lastUpdated,
            );
        });
    }
}
