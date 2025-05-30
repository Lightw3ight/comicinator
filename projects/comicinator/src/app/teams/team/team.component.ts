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
import { CharacterListComponent } from '../../characters/character-list/character-list.component';
import { MessagingService } from '../../core/messaging/messaging.service';
import { TeamsStore } from '../../core/store/teams/teams.store';
import { generateImagePath } from '../../shared/generate-image-path';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
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
        PageHeaderComponent,
        MatIcon,
        MatIconButton,
    ],
})
export class TeamComponent {
    private teamDetailsStore = inject(TeamDetailsStore);
    private teamsStore = inject(TeamsStore);
    private messagingService = inject(MessagingService);
    private router = inject(Router);

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

    protected async edit() {
        const ref = this.dialog.open(TeamFormComponent, {
            data: this.team(),
            minWidth: 700,
        });

        await firstValueFrom(ref.afterClosed());
        this.teamDetailsStore.updateItem();
    }

    protected async deleteTeam() {
        const team = this.team();
        if (team) {
            const confirmDelete = await this.messagingService.confirm(
                'Delete team',
                `Are you sure you want to delete the team ${team.name}`,
            );
            if (confirmDelete) {
                await this.teamsStore.removeTeam(team.id);
                this.router.navigate(['/teams'], { replaceUrl: true });
            }
        }
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
