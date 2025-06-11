import {
    Component,
    computed,
    contentChild,
    effect,
    input,
    OnInit,
    signal,
    untracked,
} from '@angular/core';
import { observeSize } from '../observers/observe-size';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ThumbListRowComponent } from './thumb-list-row/thumb-list-row.component';
import { ThumbListItemTemplateDirective } from './thumb-list-item-template.directive';
import { CommonModule } from '@angular/common';
import { generateUUID } from '../generate-uuid';

@Component({
    selector: 'cbx-virtual-thumb-list',
    templateUrl: 'virtual-thumb-list.component.html',
    styleUrl: 'virtual-thumb-list.component.scss',
    imports: [CommonModule, ScrollingModule, ThumbListRowComponent],
})
export class VirtualThumbListComponent {
    public readonly itemWidth = input.required<number>();
    public readonly itemHeight = input.required<number>();
    public readonly data = input.required<any[]>();

    protected readonly elementSize = observeSize();
    protected readonly columnCount = this.computeColumnCount();
    protected readonly rows = this.computeRows();
    protected readonly itemTemplate = contentChild.required(
        ThumbListItemTemplateDirective
    );
    private readonly dataId = signal(generateUUID());

    constructor() {
        effect(() => {
            this.data();

            untracked(() => {
                this.dataId.set(generateUUID());
            });
        });
    }

    protected trackRow = (index: number, _item: any): string => {
        return `${this.dataId()}-${this.columnCount()}-${index}`;
    };

    private computeRows() {
        return computed(() => {
            const columnCount = this.columnCount();
            const dataLength = this.data().length;

            if (columnCount === 0 || dataLength === 0) {
                return [];
            }

            const rowCount = Math.ceil(dataLength / columnCount);

            return new Array(rowCount).fill(0);
        });
    }

    private computeColumnCount() {
        return computed(() => {
            const { width } = this.elementSize() || { width: 0 };
            const itemWidth = this.itemWidth();
            if (width === 0 || itemWidth === 0) {
                return 0;
            }

            return Math.max(Math.floor(width / itemWidth), 1);
        });
    }
}
