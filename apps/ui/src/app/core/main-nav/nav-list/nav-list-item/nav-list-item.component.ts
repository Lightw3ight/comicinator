import { Component, input } from '@angular/core';
import { RouterLink, UrlTree } from '@angular/router';

@Component({
    selector: 'cbx-nav-list-item',
    templateUrl: 'nav-list-item.component.html',
    styleUrl: 'nav-list-item.component.scss',
    imports: [RouterLink],
})
export class NavListItemComponent {
    public readonly label = input.required<string>();
    public readonly url = input<any[] | string | UrlTree | null | undefined>();
    public readonly progress = input<number>();
}
