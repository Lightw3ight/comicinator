import { Component, computed, contentChild, input, OnInit } from '@angular/core';
import { observeSize } from '../observers/observe-size';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { ThumbListRowComponent } from './thumb-list-row/thumb-list-row.component';
import { ThumbListItemTemplateDirective } from './thumb-list-item-template.directive';

@Component({
    selector: 'cbx-virtual-thumb-list',
    templateUrl: 'virtual-thumb-list.component.html',
    imports: [ScrollingModule, ThumbListRowComponent]
})
export class VirtualThumbListComponent {
    public readonly itemWidth = input.required<number>();
    public readonly itemHeight = input.required<number>();
    public readonly data = input.required<any[]>();

    private readonly elementSize = observeSize();
    protected readonly columnCount = this.computeColumnCount();
    protected readonly rows = this.computeRows();
    protected readonly itemTemplate = contentChild.required(ThumbListItemTemplateDirective);

    private computeRows() {
        return computed(() => {
            const columnCount = this.columnCount();
            const dataLength = this.data().length; 

            if (columnCount === 0 || dataLength === 0) {
                return [];
            }

            const rowCount = Math.ceil(dataLength / columnCount);

            return new Array(rowCount).fill(0); // .map((_, index) => index);
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
