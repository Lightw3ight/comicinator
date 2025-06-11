import { Component, input } from '@angular/core';

@Component({
    selector: 'cbx-sort-item',
    template: '',
})
export class SortItemComponent {
    public readonly field = input.required<string>();
    public readonly label = input.required<string>();
}
