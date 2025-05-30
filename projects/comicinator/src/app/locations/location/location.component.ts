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
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BookListComponent } from '../../books/book-list/book-list.component';
import { MessagingService } from '../../core/messaging/messaging.service';
import { LocationsStore } from '../../core/store/locations/locations.store';
import { generateImagePath } from '../../shared/generate-image-path';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LocationFormComponent } from '../location-form/location-form.component';
import { LocationDetailsStore } from './store/location-details.store';

@Component({
    selector: 'cbx-location',
    templateUrl: 'location.component.html',
    styleUrl: 'location.component.scss',
    providers: [LocationDetailsStore],
    imports: [
        BookListComponent,
        MatTabsModule,
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
    ],
})
export class LocationComponent {
    private locationDetailsStore = inject(LocationDetailsStore);
    private locationsStore = inject(LocationsStore);
    private messagingService = inject(MessagingService);
    private router = inject(Router);

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

    protected async deleteLocation() {
        const location = this.location();
        if (location) {
            const confirmDelete = await this.messagingService.confirm(
                'Delete location',
                `Are you sure you want to delete the location ${location.name}`,
            );
            if (confirmDelete) {
                await this.locationsStore.removeLocation(location.id);
                this.router.navigate(['/locations'], { replaceUrl: true });
            }
        }
    }

    public async edit() {
        const ref = this.dialog.open(LocationFormComponent, {
            data: this.location(),
            minWidth: 700,
        });
        await firstValueFrom(ref.afterClosed());
        this.locationDetailsStore.updateItem();
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
