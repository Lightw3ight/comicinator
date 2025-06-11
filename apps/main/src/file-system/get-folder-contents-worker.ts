import fs from 'fs';
import path from 'path';
import { parentPort, workerData } from 'worker_threads';

const args: { filePath: string; recursive: boolean } = workerData;

const COMIC_EXTENSIONS = ['.cbz', '.cbr'];

// async getFolderContents(filePath: string, recursive = false) {
const files = fs.readdirSync(args.filePath, {
    recursive: args.recursive,
    withFileTypes: true,
});

const fileNames = files
    .filter((item) => {
        const isComic = COMIC_EXTENSIONS.includes(
            path.extname(item.name).toLocaleLowerCase()
        );
        return item.isFile() && isComic;
    })
    .map((item) => path.join(item.parentPath, item.name));

parentPort?.postMessage(fileNames);
