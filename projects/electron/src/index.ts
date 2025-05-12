import AdmZip from 'adm-zip';
import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import * as fs from 'fs';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { getFileSystemMethods } from './file-system/file-system-handlers';
import { getSqlHandlers } from './handlers/sql-handlers';
import { getZipThumbnail } from './helpers/get-zip-thumbnail';
import { isImage } from './helpers/is-jpg';
import { createLazyValue } from './helpers/lazy-value';
import { ZIP_HANDLERS } from './zip/zip-handlers';

// import sharp from 'sharp';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const mainWindow = createLazyValue<BrowserWindow>();
const dataPath = app.isPackaged
    ? path.join(__dirname, 'data')
    : path.join(
          __dirname.substring(0, __dirname.lastIndexOf('\\')),
          'debug-data'
      );
const thumbPath = path.join(dataPath, 'thumb-cache');
const noThumbAvailablePath = path.join(dataPath, 'no-thumbnail.jpg');

try {
    fs.accessSync(thumbPath);
} catch {
    fs.mkdirSync(thumbPath, { recursive: true });
}

// const db = {} as any;// new Database('D:\\projects\\comicinator\\db\\cdb.db', { fileMustExist: true });

const dbLoader = open({
    filename: path.join(dataPath, 'cdb.db'),
    driver: sqlite3.Database,
});

console.log('DIR', __dirname);

const createWindow = (): void => {
    // Create the browser window.
    mainWindow.set(
        new BrowserWindow({
            height: 600,
            width: 800,
            webPreferences: {
                webSecurity: true,
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
            },
        })
    );

    const startURL = app.isPackaged
        ? `file://${path.join(__dirname, 'comicinator', 'index.html')}`
        : `http://localhost:4200`;

    const filter = {
        urls: ['https://comicvine.gamespot.com/*'],
    };

    mainWindow().webContents.session.webRequest.onBeforeSendHeaders(
        filter,
        (details, callback) => {
            details.requestHeaders.Origin = `https://comicvine.gamespot.com/*`;
            callback({ requestHeaders: details.requestHeaders });
        }
    );

    mainWindow().webContents.session.webRequest.onHeadersReceived(
        filter,
        (details, callback) => {
            details.responseHeaders['access-control-allow-origin'] = [
                'http://localhost:4200', // URL your local electron app hosted
            ];
            callback({ responseHeaders: details.responseHeaders });
        }
    );

    mainWindow().loadURL(startURL);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    protocol.handle('zip-thumb', async (request) => {
        const url = request.url
            .replace(/^zip-thumb:\/\//, '')
            .replace(/\//g, '\\');
        const normalizedPath = decodeURIComponent(url);

        console.log('handling', normalizedPath);
        return getZipThumbnail(normalizedPath, thumbPath, noThumbAvailablePath);
    });

    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        dbLoader.then((db) => db.close());
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
    // const info = zip.getEntry('ComicInfo.xml');

    // const img = zip.getEntry(
    //     'Aquamen 002 (2022) (Digital) (BlackManta-Empire)/Aquamen (2022-) 002-000.jpg'
    // );

    // if (img) {
    //     return img.getData();
    // }

    // if (info) {
    //     return zip.readAsText(info);
    // }

    return zip
        .getEntries()
        .filter((o) => isImage(o.entryName))
        .map((o) => o.getData());
});

// ipcMain.handle('unzip', (_evt, filePath) => {
//     const zip = new AdmZip(filePath);
//     const info = zip.getEntry('ComicInfo.xml');

//     const img = zip.getEntry(
//         'Aquamen 002 (2022) (Digital) (BlackManta-Empire)/Aquamen (2022-) 002-000.jpg'
//     );

//     if (img) {
//         return img.getData();
//     }

//     if (info) {
//         return zip.readAsText(info);
//     }

//     return zip.getEntries().map((o) => o.entryName);
// });

function registerHandlers(
    prefix: string,
    handlers: { [key: string]: Function }
) {
    Object.entries(handlers).forEach(([name, fn]: [string, Function]) => {
        ipcMain.handle(`${prefix}-${name}`, async (_evt: any, ...args: any[]) =>
            fn(...args)
        );
    });
}

registerHandlers('fs', getFileSystemMethods(mainWindow));

registerHandlers('sql', getSqlHandlers(dbLoader));

registerHandlers('zip', ZIP_HANDLERS);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
