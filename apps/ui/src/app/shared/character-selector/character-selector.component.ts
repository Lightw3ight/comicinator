import {
    Component,
    computed,
    effect,
    inject,
    model,
    OnInit,
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
import { Character } from '../../core/models/character.interface';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { CharacterSelectorItemComponent } from './character-selector-item/character-selector-item.component';

@Component({
    selector: 'cbx-character-selector',
    templateUrl: 'character-selector.component.html',
    styleUrl: 'character-selector.component.scss',
    imports: [
        CharacterSelectorItemComponent,
        MatInputModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
    ],
})
export class CharacterSelectorComponent {
    private charactersStore = inject(CharactersStore);

    public readonly selection = model<number[]>([]);

    protected selectedCharacters = this.computeSelectedCharacters();
    protected searchControl = new FormControl();
    protected filterValue = toSignal(this.searchControl.valueChanges);
    protected searchResults = signal<Character[]>([]);

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
                    await this.charactersStore.quickFind(filterValue);

                if (timeStamp === current) {
                    const filtered = results.filter(
                        (item) => !this.selection().includes(item.id),
                    );
                    this.searchResults.set(filtered);
                }
            });
        });
    }

    protected removeItem(item: Character) {
        this.selection.set(this.selection().filter((o) => o !== item.id));
    }

    protected addItem(args: MatAutocompleteSelectedEvent) {
        this.selection.set([...this.selection(), args.option.value]);
        this.searchControl.setValue('');
    }

    private computeSelectedCharacters() {
        return computed(() => {
            const items = this.selection()
                .map((id) => this.charactersStore.entityMap()[id])
                .filter((val) => val != null);
            return items;
        });
    }
}
