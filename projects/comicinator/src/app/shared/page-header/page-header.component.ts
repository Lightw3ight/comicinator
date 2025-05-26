import { Component, input } from '@angular/core';

@Component({
    selector: 'cbx-page-header',
    templateUrl: 'page-header.component.html',
    styleUrl: 'page-header.component.scss',
})
export class PageHeaderComponent {
    public title = input<string>();
}
