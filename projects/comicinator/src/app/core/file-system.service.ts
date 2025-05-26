import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileSystemService {
    private electron: any = (window as any)['electron'];

    public async exists(path: string) {
        return await this.electron.fsExists(path);
    }

    public async getFolderContents(
        path: string,
        recursive = false,
    ): Promise<string[]> {
        return await this.electron.fsGetFolderContents(path, recursive);
    }

    public async openDirectory(
        defaultPath?: string,
    ): Promise<string | undefined> {
        return await this.electron.fsOpenDirectory(defaultPath);
    }

    public async openFile(multiple = false): Promise<string[]> {
        return await this.electron.fsOpenFile(multiple);
    }

    public async moveFile(source: string, destination: string) {
        return await this.electron.fsMoveFile(source, destination);
    }

    public showItemInFolder(filePath: string) {
        this.electron.fsShowItemInFolder(filePath);
    }
}
