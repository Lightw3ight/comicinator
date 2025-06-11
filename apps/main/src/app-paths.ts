import { app } from 'electron';
import path from 'path';
import * as fs from 'fs';

const DB_FILENAME = 'cdb.db';
const THUMB_CACHE_FOLDER = 'thumb-cache';
const NO_IMG_FILE_NAME = 'no-image.jpg';
const ICO_FILE_NAME = 'app.ico';
const APP_NAME = 'comicinator';

export const NO_IMAGE_PATH = app.isPackaged
    ? path.join(process.resourcesPath, NO_IMG_FILE_NAME)
    : path.join(app.getAppPath(), 'resources', NO_IMG_FILE_NAME);

export const DATA_PATH = app.isPackaged
    ? path.join(app.getPath('appData'), APP_NAME, DB_FILENAME)
    : path.join(app.getAppPath(), 'debug-data', DB_FILENAME);

export const ICO_PATH = app.isPackaged
    ? path.join(process.resourcesPath, ICO_FILE_NAME)
    : path.join(app.getAppPath(), 'resources', ICO_FILE_NAME);

export const THUMB_CACHE_PATH = app.isPackaged
    ? path.join(app.getPath('appData'), APP_NAME, THUMB_CACHE_FOLDER)
    : path.join(app.getAppPath(), 'debug-data', THUMB_CACHE_FOLDER);

try {
    fs.accessSync(THUMB_CACHE_PATH);
} catch {
    fs.mkdirSync(THUMB_CACHE_PATH, { recursive: true });
}
