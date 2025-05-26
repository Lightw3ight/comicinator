import {
    Component,
    computed,
    effect,
    inject,
    input,
    numberAttribute,
    OnDestroy,
    signal,
    untracked,
} from '@angular/core';
import { BookListComponent } from '../../books/book-list/book-list.component';
import { BooksStore } from '../../core/store/books/books.store';
import { TeamsStore } from '../../core/store/teams/teams.store';
import { CharacterListComponent } from '../../characters/character-list/character-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { MatDialog } from '@angular/material/dialog';
import { TeamFormComponent } from '../team-form/team-form.component';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';

@Component({
    selector: 'cbx-team',
    templateUrl: 'team.component.html',
    styleUrl: 'team.component.scss',
    imports: [
        BookListComponent,
        CharacterListComponent,
        MatTabsModule,
        IconButtonComponent,
    ],
})
export class TeamComponent implements OnDestroy {
    private teamsStore = inject(TeamsStore);
    private booksStore = inject(BooksStore);
    private charactersStore = inject(CharactersStore);

    public id = input.required({ transform: numberAttribute });

    protected team = this.computeTeam();
    protected books = this.computeBooks();
    protected characters = this.computeCharacters();
    protected activeTabIndex = signal(0);
    protected imageUrl = signal<string | undefined>(undefined);
    private dialog = inject(MatDialog);

    constructor() {
        effect(() => {
            const teamId = this.id();

            untracked(() => {
                this.teamsStore.setActiveTeam(teamId);
            });
        });

        effect(() => {
            const team = this.team();

            untracked(() => {
                if (team?.image) {
                    this.setImage(team.image);
                } else {
                    this.disposeImage();
                }
            });
        });
    }

    public ngOnDestroy() {
        this.teamsStore.clearActiveTeam();
        this.disposeImage();
    }

    public edit() {
        this.dialog.open(TeamFormComponent, {
            data: this.team(),
            minWidth: 700,
        });
    }

    private computeTeam() {
        return computed(() => {
            const id = this.id();
            return this.teamsStore.entityMap()[id];
        });
    }

    private computeCharacters() {
        return computed(() => {
            const em = this.charactersStore.entityMap();
            return this.teamsStore.activeTeam
                .characterIds()
                .map((id) => em[id]);
        });
    }

    private computeBooks() {
        return computed(() => {
            const em = this.booksStore.entityMap();
            return this.teamsStore.activeTeam.bookIds().map((id) => em[id]);
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
