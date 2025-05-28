import { Component, computed, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { Team } from '../../core/models/team.interface';
import { generateImageCssSrc } from '../../shared/generate-image-path';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { TeamFormComponent } from '../team-form/team-form.component';

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
    public team = input.required<Team>();
    private dialog = inject(MatDialog);

    protected imageCssUrl = this.computeImageUrlSrc();
    private timeStamp = signal<Date | undefined>(undefined);

    public async onEditClick(args: MouseEvent) {
        args.stopPropagation();
        const ref = this.dialog.open(TeamFormComponent, {
            data: this.team(),
            minWidth: 700,
            disableClose: true,
        });
        await firstValueFrom(ref.afterClosed());

        this.timeStamp.set(new Date());
    }

    private computeImageUrlSrc() {
        return computed(() => {
            return generateImageCssSrc(
                this.team().id,
                'team',
                this.timeStamp() ?? this.team().lastUpdated,
            );
        });
    }
}
