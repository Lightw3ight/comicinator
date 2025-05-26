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

    protected itemsToImport = signal(this.createImportItems());
    protected selectedItem = signal<ImportItem | undefined>(undefined);
    private sort = viewChild(MatSort);
    protected dataSource = new MatTableDataSource<ImportItem>(
        this.itemsToImport(),
    );
    protected thumbPath = this.computeThumbSrc();

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

    protected async startImport() {
        const ref = this.dialog.open(ImportProgressComponent, {
            minWidth: 300,
            data: this.itemsToImport(),
            disableClose: true,
        });
        await firstValueFrom(ref.afterClosed());
        this.dialogRef.close();
    }

    private createImportItems() {
        const rx = /^(.*?) (\d{1,3}) \((\d{4})\)/;

        return this.filePaths.map<ImportItem>((itemPath) => {
            const filePath = itemPath.replaceAll('/', '\\');
            const fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            let item: Omit<ImportItem, 'outputPath'>;
            const match = fileName.match(rx);

            if (match) {
                item = {
                    filePath,
                    name: match[1],
                    issueNumber: !isNaN(Number(match[2]))
                        ? Number(match[2])
                        : undefined,
                    year: match[3],
                };
            } else {
                item = {
                    filePath,
                    name: fileName.substring(0, fileName.lastIndexOf('.')),
                };
            }

            return {
                ...item,
                outputPath: this.generateOutputPath(item),
            };
        });
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

        for (let item of items) {
            const ref = this.dialog.open(BookSearchResultsComponent, {
                data: {
                    series: item.name,
                    number: item.issueNumber,
                    volume: item.year,
                    filePath: item.filePath,
                },
                minWidth: 900,
                minHeight: 200,
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
        let keyMatch = key.match(TOKEN_PADDING_RX);
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
                ? value.replaceAll(/[<>:"\/\\|?*]/g, '')
                : value;
        } else {
            return value.toString().padStart(padding, '0');
        }
    }
}
