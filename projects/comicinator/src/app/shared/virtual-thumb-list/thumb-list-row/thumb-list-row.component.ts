import { Component, computed, input, TemplateRef } from '@angular/core';

@Component({
    selector: 'cbx-thumb-list-row',
    templateUrl: 'thumb-list-row.component.html',
})
export class ThumbListRowComponent {
    public readonly rowIndex = input.required<number>();
    public readonly columnCount = input.required<number>();
    public readonly data = input.required<any[]>();
    public readonly itemTemplate = input.required<TemplateRef<any>>();

    protected readonly rowData = this.computeRowData();

    private computeRowData() {
        return computed(() => {
            const startIndex = this.rowIndex() * this.columnCount();
            const endIndex = startIndex + this.columnCount();
            return this.data().slice(startIndex, endIndex);
        });
    }
}
