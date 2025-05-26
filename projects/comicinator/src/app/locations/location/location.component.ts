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
import { BooksStore } from '../../core/store/books/books.store';
import { LocationsStore } from '../../core/store/locations/locations.store';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { LocationFormComponent } from '../location-form/location-form.component';

@Component({
    selector: 'cbx-location',
    templateUrl: 'location.component.html',
    styleUrl: 'location.component.scss',
    imports: [BookListComponent, MatTabsModule, IconButtonComponent],
})
export class LocationComponent {
    private booksStore = inject(BooksStore);
    private locationsStore = inject(LocationsStore);

    public id = input.required({ transform: numberAttribute });

    protected location = this.computeLocation();
    protected books = this.computeBooks();
    protected activeTabIndex = signal(0);
    protected imageUrl = signal<string | undefined>(undefined);
    private dialog = inject(MatDialog);

    constructor() {
        effect(() => {
            const locationId = this.id();

            untracked(() => {
                this.locationsStore.setActiveLocation(locationId);
            });
        });

        effect(() => {
            const location = this.location();

            untracked(() => {
                if (location?.image) {
                    this.setImage(location.image);
                } else {
                    this.disposeImage();
                }
            });
        });
    }

    public edit() {
        this.dialog.open(LocationFormComponent, {
            data: this.location(),
            minWidth: 700,
        });
    }

    private computeLocation() {
        return computed(() => {
            const id = this.id();
            return this.locationsStore.entityMap()[id];
        });
    }

    private computeBooks() {
        return computed(() => {
            const bookIds = this.locationsStore.activeLocation.bookIds();
            return bookIds.map((id) => this.booksStore.entityMap()[id]);
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
}
