import {
    Component,
    computed,
    effect,
    input,
    OnDestroy,
    output,
    signal,
    untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Team } from '../../../core/models/team.interface';

@Component({
    selector: 'cbx-team-selector-item',
    templateUrl: 'team-selector-item.component.html',
    styleUrl: 'team-selector-item.component.scss',
    imports: [MatButtonModule, MatIconModule],
})
export class TeamSelectorItemComponent implements OnDestroy {
    public team = input.required<Team>();

    public remove = output();
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
            return `url('${this.imageUrl()}')`;
        });
    }
}
