import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'cbx-progress-takeover',
    templateUrl: 'progress-takeover.component.html',
    styleUrl: 'progress-takeover.component.scss',
    imports: [MatProgressSpinner],
})
export class ProgressTakeoverComponent {
    public message = input<string>();
    public value = input<number>();
}
