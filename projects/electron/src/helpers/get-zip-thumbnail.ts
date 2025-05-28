import { net } from 'electron';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
// import { Worker } from 'worker_threads';
import { readFirst } from '../zip/read-first';
import { hashString } from './hash-string';
import { generateThumb } from '../zip/generate-thumb';

interface ImageQueueItem {
    loader: Promise<void>;
    resolve: () => void;
    aborted: boolean;
}

const imageQueue: { [key: string]: ImageQueueItem } = {};

export function abortImageQueue() {
    const queueItems = Object.entries(imageQueue);

    queueItems.forEach(([, item]) => (item.aborted = true));

    for (let [key, item] of queueItems) {
        delete imageQueue[key];
        item.resolve();
    }
}

export async function getZipThumbnail(
    zipPath: string,
    thumbsPath: string,
    fallbackImagePath: string,
) {
    const hash = hashString(zipPath);
    const thumbPath = path.join(thumbsPath, `${hash}.jpg`);

    if (!(await exists(thumbPath))) {
        const loaders = Object.values(imageQueue).map((o) => o.loader);

        if (imageQueue[thumbPath]) {
            await imageQueue[thumbPath];
        } else {
            let resolve: () => void;
            let reject: (err: any) => void;
            let loader = new Promise<void>((rs, rj) => {
                (resolve = rs), (reject = rj);
            });
            const queueItem: ImageQueueItem = {
                loader,
                resolve,
                aborted: false,
            };

            imageQueue[thumbPath] = queueItem;

            if (loaders.length > 0) {
                await Promise.all(loaders);
            }

            if (queueItem.aborted) {
                return undefined;
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
