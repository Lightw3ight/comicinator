import { net } from 'electron';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
// import { Worker } from 'worker_threads';
import { readFirst } from '../zip/read-first';
import { hashString } from './hash-string';
import { generateThumb } from '../zip/generate-thumb';

const imageQueue: { [key: string]: Promise<void> } = {};

export async function getZipThumbnail(
    zipPath: string,
    thumbsPath: string,
    fallbackImagePath: string,
) {
    const hash = hashString(zipPath);
    const thumbPath = path.join(thumbsPath, `${hash}.jpg`);

    if (!(await exists(thumbPath))) {
        const loaders = Object.values(imageQueue);

        if (imageQueue[thumbPath]) {
            await imageQueue[thumbPath];
        } else {
            let resolve: () => void;
            let reject: (err: any) => void;
            let queueItem = new Promise<void>((rs, rj) => {
                (resolve = rs), (reject = rj);
            });
            imageQueue[thumbPath] = queueItem;

            if (loaders.length > 0) {
                await Promise.all(loaders);
            }

            try {
                console.log('GENERATING THUMB:', zipPath);
                const imageBuffer = await readFirst(zipPath, '.jpg');
                await generateThumb(zipPath, thumbsPath, imageBuffer);
            } catch {
                await sharp(fallbackImagePath)
                    .resize({ withoutEnlargement: true, width: 300 })
                    .jpeg({ quality: 80 })
                    .toFile(thumbPath);
            }
            resolve();

            delete imageQueue[thumbPath];
        }
    }

    return net.fetch(`file:///${thumbPath}`);
}

async function exists(filePath: string) {
    try {
        await fs.promises.access(filePath);
    } catch {
        return false;
    }

    return true;
}
