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

    public async sqlRun<T>(sql: string, ...params: any[]): Promise<any>;
    public async sqlRun<T>(stmt: SqlStatement): Promise<any>;

    public async sqlRun(
        sqlOrStmt: string | SqlStatement,
        ...params: any[]
    ): Promise<any> {
        if (typeof sqlOrStmt === 'object') {
            return this.electron.sqlRun(sqlOrStmt.sql, sqlOrStmt.args);
        } else {
            return this.electron.sqlRun(sqlOrStmt, ...params);
        }
    }

    public async sqlSelectAll<T>(sql: string, ...params: any[]): Promise<T[]>;
    public async sqlSelectAll<T>(stmt: SqlStatement): Promise<T[]>;

    public async sqlSelectAll<T>(
        sqlOrStmt: string | SqlStatement,
        ...params: any[]
    ): Promise<T[]> {
        if (typeof sqlOrStmt === 'object') {
            return this.electron.sqlSelectAll(sqlOrStmt.sql, sqlOrStmt.args);
        } else {
            return this.electron.sqlSelectAll(sqlOrStmt, ...params);
        }
    }

    public async sqlSelect<T>(sql: string, ...params: any[]): Promise<T>;
    public async sqlSelect<T>(stmt: SqlStatement): Promise<T>;

    public async sqlSelect<T>(
        sqlOrStmt: string | SqlStatement,
        ...params: any[]
    ): Promise<T | undefined> {
        if (typeof sqlOrStmt === 'object') {
            return this.electron.sqlSelect(sqlOrStmt.sql, sqlOrStmt.args);
        } else {
            return this.electron.sqlSelect(sqlOrStmt, ...params);
        }
    }

    public async sqlTransact(
        statements: (SqlStatement | string)[],
    ): Promise<void> {
        return await this.electron.sqlTransaction(statements);
    }

    public async sqlDeleteBook(bookId: number, deleteFile: boolean) {
        return await this.electron.sqlDeleteBook(bookId, deleteFile);
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
