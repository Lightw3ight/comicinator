import {
    Component,
    computed,
    effect,
    inject,
    signal,
    untracked,
    viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { BookSearchResultsComponent } from '../books/book-form/book-search-results/book-search-results.component';
import { BookResult } from '../core/api/comic-vine/models/book-result.interface';
import { VolumeResult } from '../core/api/comic-vine/models/volume-result.interface';
import { Dictionary } from '../core/models/dictionary.interface';
import { SettingsStore } from '../core/store/settings/settings.store';
import { bookThumbSrc } from '../shared/book-thumb-path';
import { ImportItem } from './import-item.interface';
import { ImportProgressComponent } from './import-progress/import-progress.component';
import { parseFileDetails } from '../shared/parse-file-details';
import { ImportListItemComponent } from './import-list-item/import-list-item.component';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

const TOKEN_RX = /{([^}]*)}/g;
const INNER_TOKEN_RX = /<([^>]*)>/g;
const TOKEN_PADDING_RX = /^(\D+)(\d+)$/;

@Component({
    selector: 'cbx-import-books',
    templateUrl: 'import-books.component.html',
    styleUrl: 'import-books.component.scss',
    imports: [
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatTableModule,
        ImportListItemComponent,
        CdkDrag,
        CdkDragHandle,
    ],
})
export class ImportBooksComponent {
    protected filePaths = inject<string[]>(MAT_DIALOG_DATA);
    private dialog = inject(MatDialog);
    private settingsStore = inject(SettingsStore);
    private dialogRef = inject(MatDialogRef<ImportBooksComponent>);

    protected displayedColumns = [
        'name',
        'issueNumber',
        'year',
        'filePath',
        'outputPath',
    ];

    protected readonly selectedItem = signal<ImportItem | undefined>(undefined);
    protected readonly itemsToImport = signal(this.createImportItems());
    private readonly sort = viewChild(MatSort);
    protected dataSource = new MatTableDataSource<ImportItem>(
        this.itemsToImport(),
    );
    protected readonly thumbPath = this.computeThumbSrc();
    protected readonly canImport = this.computeCanImport();

    constructor() {
        effect(() => {
            const sort = this.sort();

            if (sort) {
                untracked(() => {
                    this.dataSource.sort = sort;
                });
            }
        });

        effect(() => {
            const items = this.itemsToImport();

            if (items) {
                this.selectedItem.set(items[0]);

                untracked(() => {
                    this.dataSource.data = items;
                });
            }
        });
    }

    protected toggleItemSelection(item: ImportItem, selected: boolean) {
        const items = [...this.itemsToImport()];
        const ix = items.indexOf(item);

        items.splice(ix, 1, {
            ...item,
            selected,
        });
        this.itemsToImport.set(items);
    }

    protected async startImport() {
        const ref = this.dialog.open(ImportProgressComponent, {
            minWidth: 300,
            data: this.itemsToImport().filter((item) => item.selected),
            disableClose: true,
        });
        await firstValueFrom(ref.afterClosed());
        this.dialogRef.close();
    }

    private computeCanImport() {
        return computed(() => {
            return this.itemsToImport().some((o) => o.selected);
        });
    }

    private createImportItems() {
        const items = this.filePaths.map<ImportItem>((itemPath) => {
            const details = parseFileDetails(itemPath);

            const item: Omit<ImportItem, 'outputPath'> = {
                filePath: details.filePath,
                name: details.series ?? details.fileName,
                issueNumber: details.issueNumber,
                year: details.year,
                selected: true,
            };

            return {
                ...item,
                outputPath: this.generateOutputPath(item),
            };
        });

        if (items.length) {
            this.selectedItem.set(items[0]);
        }

        return items;
    }

    private generateOutputPath(item: Partial<ImportItem>) {
        const tokens = this.createTokens(item);
        const exportFileName = this.getFileName(item.filePath!, tokens);
        const exportFilePath = this.getFilePath(tokens);
        const rootPath = this.settingsStore.settings.libraryPath();
        return `${rootPath}\\${exportFilePath}\\${exportFileName}`;
    }

    protected async scanAllItems() {
        const items = this.itemsToImport();
        const newItems: ImportItem[] = [];

        for (const item of items) {
            if (item.selected) {
                const ref = this.dialog.open(BookSearchResultsComponent, {
                    data: {
                        series: item.name,
                        number: item.issueNumber,
                        volume: item.year,
                        filePath: item.filePath,
                    },
                    minWidth: 900,
                    minHeight: 200,
                    disableClose: true,
                });

                const { issue, volume } = (await firstValueFrom(
                    ref.afterClosed(),
                )) as { issue: BookResult; volume: VolumeResult };

                if (issue && volume) {
                    const newItem: ImportItem = {
                        ...item,
                        issue,
                        volume,
                        name: volume?.name ?? item.name,
                        issueNumber: issue?.issueNumber ?? item.issueNumber,
                        year: volume?.startYear ?? item.year,
                    };

                    newItems.push({
                        ...newItem,
                        outputPath: this.generateOutputPath(newItem),
                    });
                } else {
                    newItems.push({
                        ...item,
                        selected: false,
                    });
                }
            } else {
                newItems.push(item);
            }
        }

        this.itemsToImport.set(newItems);
    }

    private computeThumbSrc() {
        return computed(() => {
            const bookPath = this.selectedItem()?.filePath;
            return bookPath ? bookThumbSrc(bookPath) : undefined;
        });
    }

    private getFileName(originalFileName: string, tokens: Dictionary<any>) {
        const pattern = this.settingsStore.settings.filePattern();
        const extension = originalFileName.substring(
            originalFileName.lastIndexOf('.'),
        );
        const newName = this.createStringFromPattern(pattern, tokens);

        return newName + extension;
    }

    private getFilePath(tokens: Dictionary<any>) {
        const pattern = this.settingsStore.settings.folderPattern();
        const newPath = this.createStringFromPattern(pattern, tokens);

        return newPath
            .replaceAll('/', '\\')
            .split('\\')
            .filter((o) => !!o?.toLocaleLowerCase())
            .join('\\');
    }

    private createTokens(item: Partial<ImportItem>): Dictionary<any> {
        return {
            number: item.issue?.issueNumber ?? item.issueNumber,
            series: item.volume?.name ?? item.name,
            volume: item.volume?.startYear ?? item.year,
            year: item.volume?.startYear ?? item.year,
            publisher: item.volume?.publisher?.name,
        };
    }

    private createStringFromPattern(pattern: string, tokens: Dictionary<any>) {
        return pattern.replace(TOKEN_RX, (_match: string, value: string) => {
            return value.replace(INNER_TOKEN_RX, (_match2, tokenKey) => {
                return this.getTokenValue(tokenKey, tokens) ?? '';
            });
        });
    }

    private getTokenValue(key: string, tokens: Dictionary<any>) {
        const keyMatch = key.match(TOKEN_PADDING_RX);
        let padding = 0;

        if (keyMatch) {
            key = keyMatch[1];
            padding = Number(keyMatch[2]);
        }

        const value = tokens[key];

        if (value == null) {
            return undefined;
        } else if (isNaN(value) || padding === 0) {
            return typeof value === 'string'
                ? value.replaceAll(/[<>:"/\\|?*]/g, '')
                : value;
        } else {
            return value.toString().padStart(padding, '0');
        }
    }
}
