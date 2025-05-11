import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { SqlStatement } from './models/sql-statement.interface';


@Injectable({providedIn: 'root'})
export class ElectronService {
    private electron: any = (window as any)['electron'];

    public async readFile(filePath: string) {
        return this.electron.readFile(filePath);
    }

    public async unzip(filePath: string) {
        return this.electron.unzip(filePath);
    }

    public async sqlRun(sql: string, ...params: any[]) {
        return this.electron.sqlRun(sql, ...params);
    }

    public async sqlSelectAll<T>(sql: string, ...params: any[]): Promise<T[]> {
        return this.electron.sqlSelectAll(sql, ...params);
    }

    public async sqlSelect<T>(sql: string, ...params: any[]): Promise<T | undefined> {
        return this.electron.sqlSelect(sql, ...params);
    }

    public async sqlTransact(statements: (SqlStatement | string)[]): Promise<void> {
        return await this.electron.sqlTransaction(statements);
    }

    public async zipReadText(zipPath: string, fileName: string): Promise<string | undefined> {
        return this.electron.zipReadText(zipPath, fileName);
    }

    public async zipReadXml<T = any>(zipPath: string, fileName: string): Promise<T | undefined> {
        return this.electron.zipReadXml(zipPath, fileName);
    }
    
    public async zipReadData(zipPath: string, fileName: string): Promise<Buffer | undefined> {
        return this.electron.zipReadData(zipPath, fileName);
    }

    public async zipReadEntries(zipPath: string): Promise<string[]> {
        return this.electron.zipReadEntries(zipPath);
    }
}