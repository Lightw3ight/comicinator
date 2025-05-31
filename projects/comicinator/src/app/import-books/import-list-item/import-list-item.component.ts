import { Component, input, OnInit, output, signal } from '@angular/core';
import { ImportItem } from '../import-item.interface';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'cbx-import-list-item',
    templateUrl: 'import-list-item.component.html',
    styleUrl: 'import-list-item.component.scss',
    imports: [MatCheckbox, MatIcon, MatIconButton],
    host: {
        '[class.import-item--selected]': 'selected()',
    },
})
export class ImportListItemComponent {
    public readonly item = input.required<ImportItem>();
    public readonly selected = input(false);

    public selectionToggled = output<boolean>();

    protected readonly showDetails = signal(false);
}
