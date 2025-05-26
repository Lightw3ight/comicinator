import {
    Component,
    computed,
    effect,
    inject,
    input,
    untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooksStore } from '../../core/store/books/books.store';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { VirtualThumbListComponent } from '../../shared/virtual-thumb-list/virtual-thumb-list.component';
import { GroupListItemComponent } from './group-list-item/group-list-item.component';

@Component({
    selector: 'cbx-group-list',
    templateUrl: 'group-list.component.html',
    styleUrl: 'group-list.component.scss',
    imports: [
        GroupListItemComponent,
        VirtualThumbListComponent,
        ThumbListItemTemplateDirective,
        RouterLink,
    ],
})
export class GroupListComponent {
    private booksStore = inject(BooksStore);

    public search = input<string | null>();

    protected groups = this.computeGroups();

    protected groupField = this.booksStore.activeGroupField;

    constructor() {
        effect(() => {
            const groupField = this.booksStore.activeGroupField();

            if (groupField) {
                untracked(() => {
                    this.booksStore.loadGroups();
                });
            }
        });
    }

    private computeGroups() {
        return computed(() => {
            const search = this.search()?.toLocaleLowerCase();

            if (search == null || search === '') {
                return this.booksStore.activeGroups();
            }

            return this.booksStore
                .activeGroups()
                .filter((group) =>
                    group.name?.toLocaleLowerCase().includes(search),
                );
        });
    }
}
