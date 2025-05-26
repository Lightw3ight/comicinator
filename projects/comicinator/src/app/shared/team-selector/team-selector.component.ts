import { Component, computed, inject, model } from '@angular/core';
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
import { Team } from '../../core/models/team.interface';
import { TeamsStore } from '../../core/store/teams/teams.store';
import { TeamSelectorItemComponent } from './team-selector-item/team-selector-item.component';

@Component({
    selector: 'cbx-team-selector',
    templateUrl: 'team-selector.component.html',
    styleUrl: 'team-selector.component.scss',
    imports: [
        TeamSelectorItemComponent,
        MatInputModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
    ],
})
export class TeamSelectorComponent {
    private teamsStore = inject(TeamsStore);

    public readonly selection = model<number[]>([]);

    protected selectedTeams = this.computeSelectedTeams();
    protected searchControl = new FormControl();
    protected filterValue = toSignal(this.searchControl.valueChanges);
    protected searchResults = this.computeSearchResults();

    protected removeItem(item: Team) {
        this.selection.set(this.selection().filter((o) => o !== item.id));
    }

    protected addItem(args: MatAutocompleteSelectedEvent) {
        this.selection.set([...this.selection(), args.option.value]);
        this.searchControl.setValue('');
    }

    private computeSelectedTeams() {
        return computed(() => {
            return this.selection().map(
                (id) => this.teamsStore.entityMap()[id]
            );
        });
    }

    private computeSearchResults() {
        return computed(() => {
            const filterValue = this.filterValue()?.toLocaleLowerCase() ?? '';

            if (filterValue.length < 1) {
                return [];
            }

            return this.teamsStore.entities().filter((o) => {
                return (
                    !this.selection().includes(o.id) &&
                    (o.name + (o.aliases ?? ''))
                        .toLocaleLowerCase()
                        .includes(filterValue)
                );
            });
        });
    }
}
