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
    console.log('Aborting Image QUEUE', queueItems.length);

    queueItems.forEach(([, item]) => (item.aborted = true));

    for (const [key, item] of queueItems) {
        delete imageQueue[key];
        item.resolve();
    }
}

export async function getZipThumbnail(
    zipPath: string,
    thumbName: string | undefined,
    thumbsPath: string,
    fallbackImagePath: string,
): Promise<GlobalResponse> {
    const hash = hashString(zipPath);
    let thumbPath = path.join(thumbsPath, `${hash}.jpg`);

    if (!(await exists(thumbPath))) {
        const loaders = Object.values(imageQueue).map((o) => o.loader);

        if (imageQueue[thumbPath]) {
            await imageQueue[thumbPath];
        } else {
            let resolve: () => void = () => void 0;
            // let reject: (err: any) => void;
            const loader = new Promise<void>((rs) => {
                resolve = rs;
                // reject = rj;
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
                throw new Error(`Aborted image loading for ${thumbPath}`);
            }

            try {
                console.log('GENERATING THUMB:', zipPath);
                const imageBuffer = await readFirst(zipPath, thumbName, [
                    '.jpg',
                    '.png',
                    '.jpeg',
                    '.webp',
                ]);
                await generateThumb(zipPath, thumbsPath, imageBuffer);
            } catch (er: any) {
                console.log('ERROR MAKING THUMB', zipPath, er);
                thumbPath = fallbackImagePath;
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
