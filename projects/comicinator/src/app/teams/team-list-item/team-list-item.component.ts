import {
    Component,
    computed,
    effect,
    inject,
    input,
    signal,
    untracked,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Team } from '../../core/models/team.interface';
import { TeamFormComponent } from '../team-form/team-form.component';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';

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

    protected imageUrl = signal<string | undefined>(undefined);
    protected imageCssUrl = this.computeImageUrlSrc();

    constructor() {
        effect(() => {
            const team = this.team();

            untracked(() => {
                this.setImage(team.image);
            });
        });
    }

    public ngOnDestroy(): void {
        this.disposeImage();
    }

    public onEditClick(args: MouseEvent) {
        args.stopPropagation();
        this.dialog.open(TeamFormComponent, {
            data: this.team(),
            minWidth: 700,
            disableClose: true,
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

    private computeImageUrlSrc() {
        return computed(() => {
            return this.imageUrl() ? `url('${this.imageUrl()}')` : undefined;
        });
    }
}
