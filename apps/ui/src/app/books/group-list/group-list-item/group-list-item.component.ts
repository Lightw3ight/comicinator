import { Component, computed, inject, input } from '@angular/core';
import { BookGroupStore } from '../../../core/store/book-group/book-group.store';
import { bookThumbCssSrc } from '../../../shared/book-thumb-path';

@Component({
    selector: 'cbx-group-list-item',
    templateUrl: 'group-list-item.component.html',
    styleUrl: 'group-list-item.component.scss',
})
export class GroupListItemComponent {
    private bookGroupStore = inject(BookGroupStore);

    public groupName = input.required<string>();

    protected readonly group = this.computeGroup();

    protected readonly thumbSrc = this.computeThumbSrc();

    private computeThumbSrc() {
        return computed(() => {
            return bookThumbCssSrc(this.group().firstFilePath);
        });
    }

    private computeGroup() {
        return computed(() => {
            return this.bookGroupStore.entityMap()[this.groupName()];
        });
    }
}
