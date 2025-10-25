import { Component, input, model, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'cbx-nav-list',
    templateUrl: 'nav-list.component.html',
    styleUrl: 'nav-list.component.scss',
    imports: [MatIcon, MatIconButton],
})
export class NavListComponent {
    public readonly title = input.required<string>();
    public readonly collapsed = model(false);

    public readonly headerClick = output<void>();

    protected toggleCollapse() {
        this.collapsed.set(!this.collapsed());
    }
}
