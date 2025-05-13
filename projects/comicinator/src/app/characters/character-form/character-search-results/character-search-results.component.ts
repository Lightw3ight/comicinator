import {
    Component,
    effect,
    inject,
    OnInit,
    signal,
    viewChild,
} from '@angular/core';
import { ComicVineService } from '../../../core/api/comic-vine/comic-vine-api.service';

import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
} from '@angular/material/dialog';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CharacterResult } from '../../../core/api/comic-vine/models/character-result.interface';
import { MatButton } from '@angular/material/button';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';

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
    ],
})
export class CharacerSearchResultsComponent {
    private comicVineService = inject(ComicVineService);

    protected displayedColumns = ['name', 'realName', 'publisher'];
    protected initialSearch = inject<string>(MAT_DIALOG_DATA);
    protected results = signal<MatTableDataSource<CharacterResult>>(
        new MatTableDataSource<CharacterResult>([])
    );
    protected loading = signal(true);
    protected selectedItem = signal<CharacterResult | undefined>(undefined);
    private sort = viewChild(MatSort);

    constructor() {
        effect(async () => {
            const sort = this.sort();
            if (sort) {
                await this.search(this.initialSearch);
            }
        });
    }

    private async search(search: string) {
        this.loading.set(true);
        const results = await this.comicVineService.searchCharacters(search);
        this.results.set(new MatTableDataSource(results));
        this.results().sort = this.sort()!;
        this.loading.set(false);
    }
}
