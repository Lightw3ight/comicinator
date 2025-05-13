import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamsStore } from '../core/store/teams/teams.store';
import { ThumbListItemTemplateDirective } from '../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { VirtualThumbListComponent } from '../shared/virtual-thumb-list/virtual-thumb-list.component';
import { TeamListItemComponent } from './team-list-item/team-list-item.component';

@Component({
    selector: 'cbx-teams',
    templateUrl: 'teams.component.html',
    styleUrl: 'teams.component.scss',
    imports: [
        TeamListItemComponent,
        VirtualThumbListComponent,
        ThumbListItemTemplateDirective,
        RouterLink,
    ],
})
export class TeamsComponent {
    private teamsStore = inject(TeamsStore);

    protected teams = this.teamsStore.entities;
}
