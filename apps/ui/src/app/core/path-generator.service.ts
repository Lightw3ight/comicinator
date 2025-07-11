import { inject, Injectable } from '@angular/core';
import { Book } from './models/book.interface';
import { Dictionary } from './models/dictionary.interface';
import { PublishersStore } from './store/publishers/publishers.store';
import { SettingsStore } from './store/settings/settings.store';

const TOKEN_RX = /{([^}]*)}/g;
const INNER_TOKEN_RX = /<([^>]*)>/g;
const TOKEN_PADDING_RX = /^(\D+)(\d+)$/;

@Injectable({ providedIn: 'root' })
export class PathGeneratorService {
    private settingsStore = inject(SettingsStore);
    private publisherStore = inject(PublishersStore);

    public generatePath(item: Book) {
        const tokens = this.createTokens(item);
        const exportFileName = this.getFileName(item.filePath!, tokens);
        const exportFilePath = this.getFilePath(tokens);
        const rootPath = this.settingsStore.settings.libraryPath();
        return `${rootPath}\\${exportFilePath}\\${exportFileName}`;
    }

    private createTokens(item: Partial<Book>): Dictionary<any> {
        const publisher = item.publisherId
            ? this.publisherStore.entityMap()[item.publisherId]
            : undefined;

        return {
            number: item.number,
            series: item.series,
            volume: item.volume,
            year: item.volume,
            publisher: publisher?.name,
        };
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
            return typeof value === 'string' ? this.tidyUpString(value) : value;
        } else {
            return value.toString().padStart(padding, '0');
        }
    }

    private tidyUpString(value: string) {
        return value
            .replaceAll(/[<>:"/\\|?*]/g, '')
            .trim()
            .replace(/\.*$/, '');
    }
}
