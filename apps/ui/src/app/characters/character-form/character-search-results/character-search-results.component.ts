import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { ComicVineService } from '../../../core/api/comic-vine/comic-vine-api.service';

import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';

import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CharacterResult } from '../../../core/api/comic-vine/models/character-result.interface';
import { CharacterSearchItem } from './character-search-item.interface';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ProgressTakeoverComponent } from '../../../shared/progress-takeover/progress-takeover.component';
import { MessagingService } from '../../../core/messaging/messaging.service';

@Component({
    selector: 'cbx-character-search-results',
    templateUrl: 'character-search-results.component.html',
    styleUrl: 'character-search-results.component.scss',
    imports: [
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatDialogTitle,
        MatTableModule,
        MatButton,
        MatSortModule,
        MatProgressBar,
        CdkDrag,
        CdkDragHandle,
        ProgressTakeoverComponent,
    ],
})
export class CharacerSearchResultsComponent {
    private comicVineService = inject(ComicVineService);
    private messagingService = inject(MessagingService);
    private dialogRef = inject(MatDialogRef<CharacerSearchResultsComponent>);

    protected displayedColumns = ['name', 'realName', 'publisher'];
    protected initialSearch = inject<string>(MAT_DIALOG_DATA);
    protected results = signal<MatTableDataSource<CharacterSearchItem>>(
        new MatTableDataSource<CharacterSearchItem>([])
    );
    protected loading = signal(true);
    protected selectedItem = signal<CharacterResult | undefined>(undefined);
    private sort = viewChild(MatSort);
    protected fetchingFullCharacter = signal(false);

    constructor() {
        effect(async () => {
            const sort = this.sort();
            if (sort) {
                await this.search(this.initialSearch);
            }
        });
    }

    protected async selectCurrent() {
        const id = this.selectedItem()?.id;

        if (id != null) {
            this.fetchingFullCharacter.set(true);
            try {
                const message = () =>
                    `Failed to select character with id ${
                        this.selectedItem()!.id
                    }, Retry?`;
                const apiResult = await this.messagingService.runWithRetry(
                    () =>
                        this.comicVineService.getCharacter(
                            this.selectedItem()!.id
                        ),
                    message
                );
                this.dialogRef.close(apiResult);
            } finally {
                this.fetchingFullCharacter.set(false);
            }
        }
    }

    private async search(search: string) {
        this.loading.set(true);
        const message = () =>
            `Failed to load search results for ${search}, Retry?`;
        const results = await this.messagingService.runWithRetry(
            () => this.comicVineService.searchCharacters(search),
            message
        );

        if (results == null) {
            this.dialogRef.close();
            return;
        }

        const searchItems = results.map((o) => this.mapToListItem(o));
        this.results.set(new MatTableDataSource(searchItems));
        this.results().sort = this.sort()!;
        let first = results.find(
            (o) =>
                o.name.toLocaleLowerCase() ===
                this.initialSearch.toLocaleLowerCase()
        );
        if (!first && results.length) {
            first = results[0];
        }
        this.selectedItem.set(first);
        this.loading.set(false);
    }

    private mapToListItem(result: CharacterResult): CharacterSearchItem {
        return {
            data: result,
            name: result.name,
            realName: result.realName,
            publisher: result.publisher?.name,
        };
    }
}
