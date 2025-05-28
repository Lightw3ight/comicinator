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
import { CharactersStore } from '../../core/store/characters/characters.store';
import { PublishersStore } from '../../core/store/publishers/publishers.store';
import { generateImagePath } from '../../shared/generate-image-path';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { TeamListComponent } from '../../teams/team-list/team-list.component';
import { CharacterFormComponent } from '../character-form/character-form.component';
import { CharacterDetailsStore } from './store/character-details.store';

@Component({
    selector: 'cbx-character',
    templateUrl: 'character.component.html',
    styleUrl: 'character.component.scss',
    providers: [CharacterDetailsStore],
    imports: [
        BookListComponent,
        MatTabsModule,
        TeamListComponent,
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
    ],
})
export class CharacterComponent {
    private characterDetailsStore = inject(CharacterDetailsStore);
    private charactersStore = inject(CharactersStore);
    private publishersStore = inject(PublishersStore);
    private dialog = inject(MatDialog);
    private messagingService = inject(MessagingService);
    private router = inject(Router);

    public id = input.required({ transform: numberAttribute });

    protected activeTabIndex = signal(0);
    protected imageUrl = this.computeImageUrl();
    protected character = this.characterDetailsStore.character;
    protected books = this.characterDetailsStore.books;
    protected publisher = this.computePublisher();
    protected teams = this.characterDetailsStore.teams;

    constructor() {
        effect(() => {
            const charId = this.id();

            untracked(() => {
                this.characterDetailsStore.setActiveCharacter(charId);
            });
        });
    }

    protected async deleteCharacter() {
        const character = this.character();
        if (character) {
            const confirmDelete = await this.messagingService.confirm(
                'Delete character',
                `Are you sure you want to delete the character ${character.name}`,
            );
            if (confirmDelete) {
                await this.charactersStore.removeCharacter(character.id);
                this.router.navigate(['/characters'], { replaceUrl: true });
            }
        }
    }

    public edit() {
        this.dialog.open(CharacterFormComponent, {
            data: this.id(),
            minWidth: 700,
        });
    }

    private computePublisher() {
        return computed(() => {
            const publisherId = this.character()?.publisherId;

            return publisherId
                ? this.publishersStore.entityMap()[publisherId]
                : undefined;
        });
    }

    private computeImageUrl() {
        return computed(() => {
            return generateImagePath(
                this.id(),
                'char',
                this.character()?.lastUpdated,
            );
        });
    }
}
