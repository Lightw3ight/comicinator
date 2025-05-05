import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';


@Injectable({providedIn: 'root'})
export class ElectronService {
    private electron: any = (window as any)['electron'];

    public async readFile(filePath: string) {
        return this.electron.readFile(filePath);
    }

    public async unzip(filePath: string) {
        return this.electron.unzip(filePath);
    }

    public async sqlInsert(sql: string, ...params: any[]) {
        return this.electron.sqlInsert(sql, ...params);
    }

    public async sqlSelectAll<T>(sql: string, ...params: any[]): Promise<T[]> {
        return this.electron.sqlSelectAll(sql, ...params);
    }

    public async sqlSelect<T>(sql: string, ...params: any[]): Promise<T | undefined> {
        return this.electron.sqlSelect(sql, ...params);
    }
}