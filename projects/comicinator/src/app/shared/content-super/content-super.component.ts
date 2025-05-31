import { Component, input } from '@angular/core';
import { PageHeaderComponent } from '../page-header/page-header.component';

@Component({
    selector: 'cbx-content-super',
    templateUrl: 'content-super.component.html',
    styleUrl: 'content-super.component.scss',
    imports: [PageHeaderComponent],
})
export class ContentSuperComponent {
    public readonly title = input<string>();
    public readonly imageUrl = input<string>();
}
