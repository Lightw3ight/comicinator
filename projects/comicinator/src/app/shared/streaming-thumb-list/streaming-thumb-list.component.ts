import { DataSource, isDataSource } from '@angular/cdk/collections';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    contentChild,
    effect,
    input,
    output,
    signal,
    untracked,
} from '@angular/core';
import { generateUUID } from '../generate-uuid';
import { observeSize } from '../observers/observe-size';
import { ThumbListRowComponent } from './thumb-list-row/thumb-list-row.component';
import { ThumbListItemTemplateDirective } from '../virtual-thumb-list/thumb-list-item-template.directive';

@Component({
    selector: 'cbx-streaming-thumb-list',
    templateUrl: 'streaming-thumb-list.component.html',
    styleUrl: 'streaming-thumb-list.component.scss',
    imports: [CommonModule, ScrollingModule, ThumbListRowComponent],
})
export class StreamingThumbListComponent {
    public readonly itemWidth = input.required<number>();
    public readonly itemHeight = input.required<number>();
    public readonly data = input<DataSource<any> | any[]>();

    public readonly columnCountChange = output<number>();

    protected readonly elementSize = observeSize();
    private readonly columnCount = this.computeColumnCount();
    protected dataSource = this.computeDataSource();

    protected readonly itemTemplate = contentChild.required(
        ThumbListItemTemplateDirective,
    );
    private readonly dataId = signal(generateUUID());

    constructor() {
        effect(() => {
            const columnCount = this.columnCount();
            untracked(() => this.columnCountChange.emit(columnCount));
        });

        effect(() => {
            this.data();
            untracked(() => this.dataId.set(generateUUID()));
        });
    }

    protected trackRow = (index: number, _item: any): string => {
        return `${this.dataId()}-${this.columnCount()}-${index}`;
    };

    private computeDataSource() {
        return computed(() => {
            const data = this.data();

            if (data == null) {
                return data;
            } else if (isDataSource(data)) {
                return data;
            }

            const columnCount = this.columnCount();
            const dataLength = data.length;

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
            if (width === 0) {
                return 0;
            }

            return Math.max(Math.floor(width / itemWidth), 1);
        });
    }
}
