import {
    Component,
    computed,
    effect,
    inject,
    input,
    numberAttribute,
    untracked,
} from '@angular/core';
import { BookListComponent } from '../../books/book-list/book-list.component';
import { BooksStore } from '../../core/store/books/books.store';
import { TeamsStore } from '../../core/store/teams/teams.store';

@Component({
    selector: 'cbx-team',
    templateUrl: 'team.component.html',
    styleUrl: 'team.component.scss',
    imports: [BookListComponent],
})
export class TeamComponent {
    private teamsStore = inject(TeamsStore);
    private booksStore = inject(BooksStore);

    public id = input.required({ transform: numberAttribute });

    protected team = this.computeTeam();
    protected books = this.booksStore.searchResults;

    constructor() {
        effect(() => {
            const teamId = this.id();

            untracked(() => {
                this.booksStore.searchByTeam(teamId);
            });
        });
    }

    private computeTeam() {
        return computed(() => {
            const id = this.id();
            return this.teamsStore.entityMap()[id];
        });
    }
}
