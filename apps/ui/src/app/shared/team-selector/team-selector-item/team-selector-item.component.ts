import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Team } from '../../../core/models/team.interface';
import { generateImageCssSrc } from '../../generate-image-path';

@Component({
    selector: 'cbx-team-selector-item',
    templateUrl: 'team-selector-item.component.html',
    styleUrl: 'team-selector-item.component.scss',
    imports: [MatButtonModule, MatIconModule],
})
export class TeamSelectorItemComponent {
    public team = input.required<Team>();

    public remove = output();

    protected imageCssUrl = this.computeImageUrlSrc();

    private computeImageUrlSrc() {
        return computed(() => {
            return generateImageCssSrc(
                this.team().id,
                'team',
                this.team().lastUpdated,
            );
        });
    }
}
