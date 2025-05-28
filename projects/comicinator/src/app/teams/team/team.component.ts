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
import { CharacterListComponent } from '../../characters/character-list/character-list.component';
import { generateImagePath } from '../../shared/generate-image-path';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { TeamFormComponent } from '../team-form/team-form.component';
import { TeamDetailsStore } from './store/team-details.store';

@Component({
    selector: 'cbx-team',
    templateUrl: 'team.component.html',
    styleUrl: 'team.component.scss',
    providers: [TeamDetailsStore],
    imports: [
        BookListComponent,
        CharacterListComponent,
        MatTabsModule,
        IconButtonComponent,
    ],
})
export class TeamComponent {
    private teamDetailsStore = inject(TeamDetailsStore);

    public id = input.required({ transform: numberAttribute });

    protected team = this.teamDetailsStore.team;
    protected books = this.teamDetailsStore.books;
    protected characters = this.teamDetailsStore.characters;
    protected activeTabIndex = signal(0);
    protected imageUrl = this.computeImageUrl();
    private dialog = inject(MatDialog);

    constructor() {
        effect(() => {
            const id = this.id();

            untracked(() => {
                this.teamDetailsStore.setActiveTeam(id);
            });
        });
    }

    public edit() {
        this.dialog.open(TeamFormComponent, {
            data: this.team(),
            minWidth: 700,
        });
    }

    private computeImageUrl() {
        return computed(() => {
            return generateImagePath(
                this.id(),
                'team',
                this.team()?.lastUpdated,
            );
        });
    }
}
