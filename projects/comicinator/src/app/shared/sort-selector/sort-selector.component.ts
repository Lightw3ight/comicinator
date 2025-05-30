import {
    Component,
    computed,
    contentChildren,
    model,
    Signal,
} from '@angular/core';
import { SortDirection } from '../../core/models/sort-direction.type';
import { SortItemComponent } from './sort-item/sort-item.component';
import { SortConfig } from './sort-config.interface';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

@Component({
    selector: 'cbx-sort-selector',
    templateUrl: 'sort-selector.component.html',
    styleUrl: 'sort-selector.component.scss',
    imports: [
        MatIcon,
        MatIconButton,
        MatButton,
        MatMenu,
        MatMenuTrigger,
        MatMenuItem,
    ],
})
export class SortSelectorComponent {
    public readonly activeSort = model.required<SortConfig>();

    protected sortItems = contentChildren(SortItemComponent);
    protected activeFieldLabel = this.computeActiveFieldLabel();

    protected toggleSortDirection() {
        this.activeSort.set({
            field: this.activeSort().field,
            dir: this.activeSort().dir === 'ASC' ? 'DESC' : 'ASC',
        });
    }

    protected setActiveField(field: string) {
        this.activeSort.set({
            field: field,
            dir: this.activeSort().dir,
        });
    }

    private computeActiveFieldLabel() {
        return computed(() => {
            const field = this.activeSort()?.field;

            if (field) {
                return (
                    this.sortItems()
                        .find((o) => o.field() === field)
                        ?.label() ?? 'Unknown'
                );
            }

            return 'Unknown';
        });
    }
}
