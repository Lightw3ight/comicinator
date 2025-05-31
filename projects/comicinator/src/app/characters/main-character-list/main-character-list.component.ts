import {
    Component,
    effect,
    inject,
    input,
    signal,
    untracked,
} from '@angular/core';

import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ThumbnailDataSource } from '../../books/thumbnail-data-source';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { StreamingThumbListComponent } from '../../shared/streaming-thumb-list/streaming-thumb-list.component';
import { ThumbListItemTemplateDirective } from '../../shared/virtual-thumb-list/thumb-list-item-template.directive';
import { CharacterListItemComponent } from '../character-list-item/character-list-item.component';

@Component({
    selector: 'cbx-main-character-list',
    templateUrl: 'main-character-list.component.html',
    styleUrl: 'main-character-list.component.scss',
    imports: [
        StreamingThumbListComponent,
        ThumbListItemTemplateDirective,
        CharacterListItemComponent,
        RouterLink,
    ],
})
export class MainCharacterListComponent {
    private charactersStore = inject(CharactersStore);

    public readonly search = input<string>();

    protected readonly pagedData$ = toObservable(
        this.charactersStore.pagedData,
    );
    protected readonly dataSource = signal<
        ThumbnailDataSource<number> | undefined
    >(undefined);
    private readonly columnCount = signal(0);

    constructor() {
        effect(async () => {
            const search = this.search();
            const columnCount = this.columnCount();
            this.charactersStore.sortField();
            this.charactersStore.sortDirection();

            untracked(async () => {
                if (columnCount > 0) {
                    console.log('LOADING CHARS');
                    this.charactersStore.setColumnCount(columnCount);

                    if (search?.length) {
                        this.charactersStore.setSearch(search);
                    } else {
                        this.charactersStore.clearSearch();
                    }
                    await this.charactersStore.resetPageData();

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
            this.charactersStore.loadPage(pageIndex),
        );
    }
}
