import {
    Component,
    effect,
    inject,
    input,
    OnDestroy,
    untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ElectronService } from '../../core/electron.service';
import { FilterOperator } from '../../core/models/filter-operator.type';
import { BookGroupStore } from '../../core/store/book-group/book-group.store';
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
export class GroupListComponent implements OnDestroy {
    private bookGroupStore = inject(BookGroupStore);
    private electron = inject(ElectronService);

    public search = input<string>();
    public quickSearch = input.required<string>();
    public operator = input<FilterOperator>('starts-with');

    protected groups = this.bookGroupStore.groups;
    protected groupField = this.bookGroupStore.groupField;

    constructor() {
        effect(() => {
            const field = this.groupField();
            const operator: FilterOperator = this.search()?.length
                ? 'contains'
                : 'starts-with';
            const search = this.search() ?? this.quickSearch();

            if (field) {
                untracked(() => {
                    this.bookGroupStore.loadGroups(search, operator);
                });
            }
        });
    }

    public async ngOnDestroy() {
        await this.electron.abortImageQueue();
    }
}
