import { app, BrowserWindow, ipcMain, net, protocol, shell } from 'electron';
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import { NO_IMAGE_PATH, THUMB_CACHE_PATH, ICO_PATH } from './app-paths';
import { BookController } from './data/book/book-controller';
import { CharacterController } from './data/character/character-controller';
import { db } from './data/db';
import { initializeModelRelationships } from './data/initialize-models';
import { LocationController } from './data/location/location-controller';
import { PublisherController } from './data/publisher/publisher-controller';
import { SettingController } from './data/setting/setting-controller';
import { TeamController } from './data/team/team-controller';
import { getFileSystemMethods } from './file-system/file-system-handlers';
import { getGenericHandlers } from './helpers/generic-handlers';
import { getZipThumbnail } from './helpers/get-zip-thumbnail';
import { createLazyValue } from './helpers/lazy-value';
import { getZipHandlers } from './zip/zip-handlers';
import { LibraryController } from './data/library/library-controller';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const mainWindow = createLazyValue<BrowserWindow>();

const createWindow = (): void => {
    initializeModelRelationships();

    // Create the browser window.
    mainWindow.set(
        new BrowserWindow({
            height: 800,
            width: 1000,
            icon: ICO_PATH,
            autoHideMenuBar: true,
            webPreferences: {
                webSecurity: true,
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
            },
        }),
    );

    mainWindow().webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    function generatePackedPath() {
        const appMainRoot = __dirname.replaceAll('\\', '/');
        const dist = appMainRoot.substring(0, appMainRoot.lastIndexOf('/'));
        return `file://${path.join(dist, 'app/ui/browser/index.html')}`;
    }

    const startURL = app.isPackaged
        ? generatePackedPath()
        : `http://localhost:4200`;

    const filter = {
        urls: ['https://comicvine.gamespot.com/*'],
    };

    mainWindow().webContents.session.webRequest.onBeforeSendHeaders(
        filter,
        (details, callback) => {
            details.requestHeaders['Origin'] =
                `https://comicvine.gamespot.com/*`;
            callback({ requestHeaders: details.requestHeaders });
        },
    );

    mainWindow().webContents.session.webRequest.onHeadersReceived(
        filter,
        (details, callback) => {
            details.responseHeaders!['access-control-allow-origin'] = [
                'http://localhost:4200', // URL your local electron app hosted
            ];
            callback({ responseHeaders: details.responseHeaders });
        },
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
        const book = await BookController.selectByFilePath(normalizedPath);
        const frontCover = book?.frontCover;

        return await getZipThumbnail(
            normalizedPath,
            frontCover,
            THUMB_CACHE_PATH,
            NO_IMAGE_PATH,
        );
    });

    protocol.handle('char-img', async (request) => {
        const match = request.url.match(/(?<=char-img:\/\/)\d+/);
        const id = Number(match![0]);
        const buffer = await CharacterController.selectImage(id);

        return await handleEntityImageRequest(buffer);
    });

    protocol.handle('team-img', async (request) => {
        const match = request.url.match(/(?<=team-img:\/\/)\d+/);
        const id = Number(match![0]);
        const buffer = await TeamController.selectImage(id);

        return await handleEntityImageRequest(buffer);
    });

    protocol.handle('loc-img', async (request) => {
        const match = request.url.match(/(?<=loc-img:\/\/)\d+/);
        const id = Number(match![0]);
        const buffer = await LocationController.selectImage(id);

        return await handleEntityImageRequest(buffer);
    });

    createWindow();
});

async function handleEntityImageRequest(
    buffer: Buffer<ArrayBufferLike> | undefined,
) {
    if (buffer) {
        // Detect file type dynamically
        const fileType = await fileTypeFromBuffer(buffer);
        const mimeType = fileType ? fileType.mime : 'application/octet-stream'; // Default to binary if unknown

        const uint8Array = new Uint8Array(buffer);

        return new Response(uint8Array, {
            headers: { 'Content-Type': mimeType },
        });
    }

    return net.fetch(`file:///${NO_IMAGE_PATH}`);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
    if (process.platform !== 'darwin') {
        await db.close();
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

function registerHandlers(prefix: string, handlers: object) {
    Object.entries(handlers).forEach(([name, fn]: [string, any]) => {
        if (typeof fn === 'function') {
            ipcMain.handle(
                `${prefix}-${name}`,
                async (_evt: any, ...args: any[]) => fn(...args),
            );
        }
    });
}

function registerControllerHandlers(prefix: string, controller: any) {
    const keys = Object.getOwnPropertyNames(controller).filter(
        (o) => o !== 'constructor',
    );

    keys.forEach((key) => {
        if (typeof controller[key] === 'function') {
            ipcMain.handle(
                `${prefix}-${key}`,
                async (_evt: any, ...args: any[]) => controller[key](...args),
            );
        }
    });
}

registerHandlers('fs', getFileSystemMethods(mainWindow));

registerHandlers('zip', getZipHandlers(THUMB_CACHE_PATH));

registerHandlers('cbx', getGenericHandlers(THUMB_CACHE_PATH));

registerControllerHandlers('char', CharacterController);
registerControllerHandlers('team', TeamController);
registerControllerHandlers('loc', LocationController);
registerControllerHandlers('setting', SettingController);
registerControllerHandlers('pub', PublisherController);
registerControllerHandlers('book', BookController);
registerControllerHandlers('lib', LibraryController);
