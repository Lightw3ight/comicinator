import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import * as fs from 'fs';
import AdmZip from 'adm-zip';
// import Database from 'better-sqlite3';
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow: BrowserWindow | null;

// const db = {} as any;// new Database('D:\\projects\\comicinator\\db\\cdb.db', { fileMustExist: true });

const dbLoader = open({
    filename: 'D:\\projects\\comicinator\\db\\cdb.db',
    driver: sqlite3.Database
  });

const createWindow = (): void => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    const startURL = app.isPackaged
        ? `file://${path.join(__dirname, 'comicinator', 'index.html')}`
        : `http://localhost:4200`;

    mainWindow.loadURL(startURL);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        dbLoader.then(db => db.close());
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('read-file', async (_evt, filePath) => {
    return await fs.promises.readFile(filePath);
});

ipcMain.handle('unzip', (_evt, filePath) => {
    const zip = new AdmZip(filePath);
    const info = zip.getEntry('ComicInfo.xml');

    const img = zip.getEntry('Aquamen 002 (2022) (Digital) (BlackManta-Empire)/Aquamen (2022-) 002-000.jpg');

    if (img) {
        return img.getData()
    }

    if (info) {
        return zip.readAsText(info);
    }

    return zip.getEntries().map(o => o.entryName);
});

ipcMain.handle('sql-insert', async (_evt: any, statement: string, ...args: any[]) => {
    const db = await dbLoader;
    const stmt = await db.prepare(statement);
    const result = stmt.run(...args);
    return (await result).lastID;
});

ipcMain.handle('sql-select-all', async (_evt: any, statement: string, ...args: any[]) => {
    const db = await dbLoader;
    const stmt = await db.prepare(statement);
    return await stmt.all(...args);
});

ipcMain.handle('sql-select', async (_evt: any, statement: string, ...args: any[]) => {
    const db = await dbLoader;
    const stmt = await db.prepare(statement);
    return await stmt.get(...args);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
