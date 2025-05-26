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
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { BookListComponent } from '../../books/book-list/book-list.component';
import { MessagingService } from '../../core/messaging/messaging.service';
import { BooksStore } from '../../core/store/books/books.store';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { PublishersStore } from '../../core/store/publishers/publishers.store';
import { TeamsStore } from '../../core/store/teams/teams.store';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { TeamListComponent } from '../../teams/team-list/team-list.component';
import { CharacterFormComponent } from '../character-form/character-form.component';

@Component({
    selector: 'cbx-character',
    templateUrl: 'character.component.html',
    styleUrl: 'character.component.scss',
    imports: [
        BookListComponent,
        MatTabsModule,
        TeamListComponent,
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
    ],
})
export class CharacterComponent implements OnDestroy {
    private charactersStore = inject(CharactersStore);
    private booksStore = inject(BooksStore);
    private publishersStore = inject(PublishersStore);
    private teamsStore = inject(TeamsStore);
    private dialog = inject(MatDialog);
    private messagingService = inject(MessagingService);
    private router = inject(Router);

    public id = input.required({ transform: numberAttribute });

    protected activeTabIndex = signal(0);
    protected imageUrl = signal<string | undefined>(undefined);
    protected character = this.computeCharacter();
    protected books = this.computeBooks();
    protected publisher = this.computePublisher();
    protected teams = this.computeTeams();

    constructor() {
        effect(() => {
            const charId = this.id();

            untracked(() => {
                this.charactersStore.setActiveCharacter(charId);
            });
        });

        effect(() => {
            const char = this.character();

            untracked(() => {
                if (char?.image) {
                    this.setImage(char.image);
                } else {
                    this.disposeImage();
                }
            });
        });
    }

    public ngOnDestroy() {
        this.disposeImage();
        this.charactersStore.clearActiveCharacter();
    }

    protected async deleteCharacter() {
        const confirmDelete = await this.messagingService.confirm(
            'Delete character',
            `Are you sure you want to delete the character ${this.character().name}`,
        );
        if (confirmDelete) {
            await this.charactersStore.removeCharacter(this.character().id);
            this.router.navigate(['/characters'], { replaceUrl: true });
        }
    }

    private computeTeams() {
        return computed(() => {
            return this.charactersStore.activeCharacter
                .teamIds()
                .map((id) => this.teamsStore.entityMap()[id]);
        });
    }

    private computeBooks() {
        return computed(() => {
            return this.charactersStore.activeCharacter
                .bookIds()
                .map((id) => this.booksStore.entityMap()[id]);
        });
    }

    public edit() {
        this.dialog.open(CharacterFormComponent, {
            data: this.id(),
            minWidth: 700,
        });
    }

    private computePublisher() {
        return computed(() => {
            const { publisherId } = this.character();
            return publisherId
                ? this.publishersStore.entityMap()[publisherId]
                : undefined;
        });
    }

    private computeCharacter() {
        return computed(() => {
            const id = this.id();
            return this.charactersStore.entityMap()[id];
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
