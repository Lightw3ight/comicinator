import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '../../core/models/location.interface';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { VirtualThumbListComponent } from '../../shared/virtual-thumb-list/virtual-thumb-list.component';
import { LocationListItemComponent } from '../location-list-item/location-list-item.component';

@Component({
    selector: 'cbx-location-list',
    templateUrl: 'location-list.component.html',
    styleUrl: 'location-list.component.scss',
    imports: [
        LocationListItemComponent,
        VirtualThumbListComponent,
        ThumbListItemTemplateDirective,
        RouterLink,
    ],
})
export class LocationListComponent {
    public locations = input.required<Location[]>();
}
