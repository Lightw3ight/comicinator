import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { VirtualThumbListComponent } from '../../shared/virtual-thumb-list/virtual-thumb-list.component';
import { TeamListItemComponent } from '../team-list-item/team-list-item.component';
import { Team } from '../../core/models/team.interface';

@Component({
    selector: 'cbx-team-list',
    templateUrl: 'team-list.component.html',
    styleUrl: 'team-list.component.scss',
    imports: [
        TeamListItemComponent,
        VirtualThumbListComponent,
        ThumbListItemTemplateDirective,
        RouterLink,
    ],
})
export class TeamListComponent {
    public teams = input.required<Team[]>();
}
