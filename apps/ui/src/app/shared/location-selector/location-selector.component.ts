import {
    Component,
    computed,
    effect,
    inject,
    model,
    signal,
    untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Location } from '../../core/models/location.interface';
import { LocationsStore } from '../../core/store/locations/locations.store';
import { LocationSelectorItemComponent } from './location-selector-item/location-selector-item.component';

@Component({
    selector: 'cbx-location-selector',
    templateUrl: 'location-selector.component.html',
    styleUrl: 'location-selector.component.scss',
    imports: [
        LocationSelectorItemComponent,
        MatInputModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
    ],
})
export class LocationSelectorComponent {
    private locationsStore = inject(LocationsStore);

    public readonly selection = model<number[]>([]);

    protected selectedLocations = this.computeSelectedLocations();
    protected searchControl = new FormControl();
    protected filterValue = toSignal(this.searchControl.valueChanges);
    protected searchResults = signal<Location[]>([]);

    constructor() {
        let timeStamp: number;

        effect(() => {
            const filterValue =
                this.filterValue()?.toLocaleLowerCase()?.trim() ?? '';
            timeStamp = new Date().getTime();
            const current = timeStamp;

            untracked(async () => {
                if (filterValue.length < 1) {
                    this.searchResults.set([]);
                    return;
                }

                const results =
                    await this.locationsStore.quickFind(filterValue);

                if (timeStamp === current) {
                    this.searchResults.set(results);
                }
            });
        });
    }

    protected removeItem(location: Location) {
        this.selection.set(this.selection().filter((o) => o !== location.id));
    }

    protected addItem(args: MatAutocompleteSelectedEvent) {
        this.selection.set([...this.selection(), args.option.value]);
        this.searchControl.setValue('');
    }

    private computeSelectedLocations() {
        return computed(() => {
            return this.selection()
                .map((id) => this.locationsStore.entityMap()[id])
                .filter((val) => val != null);
        });
    }
}
