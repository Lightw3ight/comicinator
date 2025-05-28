import { Injectable } from '@angular/core';
import { SqlStatement } from './models/sql-statement.interface';
import { ComicInfoXml } from './models/comic-info-xml.interface';

@Injectable({ providedIn: 'root' })
export class ElectronService {
    private electron: any = (window as any)['electron'];

    public async readFile(filePath: string) {
        return this.electron.readFile(filePath);
    }

    public async unzip(filePath: string) {
        return this.electron.unzip(filePath);
    }

    public async run<T>(command: string, ...args: any[]): Promise<T> {
        if (this.electron[command] == null) {
            throw new Error(`No method ${command} exists as a passthrough`);
        }
        return await this.electron[command](...args);
    }

    public async abortImageQueue() {
        return await this.electron.cbxAbortImageQueue();
    }

    public async zipImportBook(
        zipPath: string,
    ): Promise<ComicInfoXml | undefined> {
        return this.electron.zipImportBook(zipPath);
    }

    public async zipReadText(
        zipPath: string,
        fileName: string,
    ): Promise<string | undefined> {
        return this.electron.zipReadText(zipPath, fileName);
    }

    public async zipReadXml<T = any>(
        zipPath: string,
        fileName: string,
    ): Promise<T | undefined> {
        return this.electron.zipReadXml(zipPath, fileName);
    }

    public async zipWriteXml<T = any>(
        zipPath: string,
        fileName: string,
        data: Object,
    ): Promise<T | undefined> {
        return this.electron.zipWriteXml(zipPath, fileName, data);
    }

    public async zipReadData(
        zipPath: string,
        fileName: string,
    ): Promise<Buffer | undefined> {
        return this.electron.zipReadData(zipPath, fileName);
    }

    public async zipReadEntries(zipPath: string): Promise<string[]> {
        return this.electron.zipReadEntries(zipPath);
    }

    public async zipReadImages(zipPath: string): Promise<Buffer[]> {
        return this.electron.zipReadImages(zipPath);
    }

    public async removeThumbCache(zipPath: string): Promise<void> {
        return this.electron.cbxRemoveThumbCache(zipPath);
    }
}
