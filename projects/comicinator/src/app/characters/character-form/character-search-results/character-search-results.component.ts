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
import { CdkDrag } from '@angular/cdk/drag-drop';

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
    ],
})
export class CharacerSearchResultsComponent {
    private comicVineService = inject(ComicVineService);
    private dialogRef = inject(MatDialogRef<CharacerSearchResultsComponent>);

    protected displayedColumns = ['name', 'realName', 'publisher'];
    protected initialSearch = inject<string>(MAT_DIALOG_DATA);
    protected results = signal<MatTableDataSource<CharacterSearchItem>>(
        new MatTableDataSource<CharacterSearchItem>([]),
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
                const apiResult = await this.comicVineService.getCharacter(
                    this.selectedItem()!.id,
                );
                this.dialogRef.close(apiResult);
            } catch {
                this.fetchingFullCharacter.set(false);
            }
        }
    }

    private async search(search: string) {
        this.loading.set(true);
        const results = await this.comicVineService.searchCharacters(search);
        const searchItems = results.map((o) => this.mapToListItem(o));
        this.results.set(new MatTableDataSource(searchItems));
        this.results().sort = this.sort()!;
        const first = results.find(
            (o) =>
                o.name.toLocaleLowerCase() ===
                this.initialSearch.toLocaleLowerCase(),
        );
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
