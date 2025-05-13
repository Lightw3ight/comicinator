import { Component, input } from '@angular/core';
import { Team } from '../../core/models/team.interface';

@Component({
    selector: 'cbx-team-list-item',
    templateUrl: 'team-list-item.component.html',
    styleUrl: 'team-list-item.component.scss',
})
export class TeamListItemComponent {
    public team = input.required<Team>();
}
