import { Component, computed, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { Team } from '../../core/models/team.interface';
import { generateImageCssSrc } from '../../shared/generate-image-path';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { TeamFormComponent } from '../team-form/team-form.component';
import { TeamsStore } from '../../core/store/teams/teams.store';

@Component({
    selector: 'cbx-team-list-item',
    templateUrl: 'team-list-item.component.html',
    styleUrl: 'team-list-item.component.scss',
    imports: [IconButtonComponent],
    host: {
        '[style.backgroundImage]': 'imageCssUrl()',
    },
})
export class TeamListItemComponent {
    private dialog = inject(MatDialog);
    private teamStore = inject(TeamsStore);

    public readonly team = input<Team>();
    public readonly teamId = input<number>();

    protected teamData = this.computeTeamData();
    protected imageCssUrl = this.computeImageUrlSrc();
    private timeStamp = signal<Date | undefined>(undefined);

    public async onEditClick(args: MouseEvent) {
        args.stopPropagation();
        const ref = this.dialog.open(TeamFormComponent, {
            data: this.teamData(),
            minWidth: 700,
            disableClose: true,
        });
        await firstValueFrom(ref.afterClosed());

        this.timeStamp.set(new Date());
    }

    private computeImageUrlSrc() {
        return computed(() => {
            return generateImageCssSrc(
                this.teamData().id,
                'team',
                this.timeStamp() ?? this.teamData().lastUpdated,
            );
        });
    }

    private computeTeamData() {
        return computed(() => {
            return this.team() ?? this.teamStore.entityMap()[this.teamId()!];
        });
    }
}
