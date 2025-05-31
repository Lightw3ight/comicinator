import {
    Component,
    effect,
    inject,
    input,
    OnDestroy,
    signal,
    untracked,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ElectronService } from '../../core/electron.service';
import { BookGroupStore } from '../../core/store/book-group/book-group.store';
import { BooksStore } from '../../core/store/books/books.store';
import { ThumbnailDataSource } from '../thumbnail-data-source';
import { GroupListItemComponent } from './group-list-item/group-list-item.component';
import { CommonModule } from '@angular/common';
import { StreamingThumbListComponent } from '../../shared/streaming-thumb-list/streaming-thumb-list.component';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';

@Component({
    selector: 'cbx-group-list',
    templateUrl: 'group-list.component.html',
    styleUrl: 'group-list.component.scss',
    imports: [
        CommonModule,
        GroupListItemComponent,
        StreamingThumbListComponent,
        ThumbListItemTemplateDirective,
        RouterLink,
    ],
})
export class GroupListComponent implements OnDestroy {
    private electron = inject(ElectronService);
    private bookGroupStore = inject(BookGroupStore);
    private bookStore = inject(BooksStore);

    public readonly search = input<string>();

    protected readonly groupField = this.bookGroupStore.groupField;
    protected readonly pagedData$ = toObservable(this.bookGroupStore.pagedData);
    protected readonly dataSource = signal<
        ThumbnailDataSource<string> | undefined
    >(undefined);
    private readonly columnCount = signal(0);

    constructor() {
        effect(async () => {
            const search = this.search();
            const columnCount = this.columnCount();
            this.bookGroupStore.groupField();
            this.bookStore.sortField();
            this.bookStore.sortDirection();
            this.bookStore.lastBookImport();

            untracked(async () => {
                if (columnCount > 0) {
                    this.bookGroupStore.setColumnCount(columnCount);

                    if (search?.length) {
                        this.bookGroupStore.setSearch(search);
                    } else {
                        this.bookGroupStore.clearSearch();
                    }
                    await this.bookGroupStore.resetPageData();

                    console.log('Refreshing data');
                    this.reloadDataSource();
                }
            });
        });
    }

    protected async onColumnCountChange(count: number) {
        this.columnCount.set(count);
    }

    private reloadDataSource() {
        if (this.dataSource()) {
            this.dataSource.set(undefined);
        }

        setTimeout(() => this.dataSource.set(this.createDataSource()));
    }

    private createDataSource() {
        return new ThumbnailDataSource(this.pagedData$, (pageIndex) =>
            this.bookGroupStore.loadPage(pageIndex),
        );
    }

    // private electron = inject(ElectronService);

    // public search = input<string>();
    // public quickSearch = input.required<string>();
    // public operator = input<FilterOperator>('starts-with');

    // protected groups = this.bookGroupStore.groups;
    // protected groupField = this.bookGroupStore.groupField;

    // constructor() {
    //     effect(() => {
    //         const field = this.groupField();
    //         const operator: FilterOperator = this.search()?.length
    //             ? 'contains'
    //             : 'starts-with';
    //         const search = this.search() ?? this.quickSearch();

    //         if (field) {
    //             untracked(() => {
    //                 this.bookGroupStore.loadGroups(search, operator);
    //             });
    //         }
    //     });
    // }

    public async ngOnDestroy() {
        await this.electron.abortImageQueue();
    }
}
