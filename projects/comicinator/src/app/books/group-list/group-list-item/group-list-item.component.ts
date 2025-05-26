import { Component, computed, input } from '@angular/core';
import { BookGroup } from '../../../core/models/book-group.interface';
import { bookThumbCssSrc } from '../../../shared/book-thumb-path';

@Component({
    selector: 'cbx-group-list-item',
    templateUrl: 'group-list-item.component.html',
    styleUrl: 'group-list-item.component.scss',
})
export class GroupListItemComponent {
    public group = input.required<BookGroup>();

    protected thumbSrc = this.computeThumbSrc();

    private computeThumbSrc() {
        return computed(() => {
            return bookThumbCssSrc(this.group().firstFilePath);
        });
    }
}
