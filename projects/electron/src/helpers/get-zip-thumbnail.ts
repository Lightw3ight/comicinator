import { net } from 'electron';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
// import { Worker } from 'worker_threads';
import { readFirst } from '../zip/read-first';
import { hashString } from './hash-string';

export async function getZipThumbnail(
    zipPath: string,
    thumbsPath: string,
    fallbackImagePath: string
) {
    const hash = hashString(zipPath);
    const thumbPath = path.join(thumbsPath, `${hash}.jpg`);

    if (!(await exists(thumbPath))) {
        try {
            // await createThumbInWorker(zipPath, thumbPath);
            // const imageBuffer = await getImageFromZipWorker(zipPath);

            const imageBuffer = await readFirst(zipPath, '.jpg');
            await sharp(imageBuffer)
                .resize({ withoutEnlargement: true, width: 300 })
                .jpeg({ quality: 80 })
                .toFile(thumbPath);
        } catch {
            await sharp(fallbackImagePath)
                .resize({ withoutEnlargement: true, width: 300 })
                .jpeg({ quality: 80 })
                .toFile(thumbPath);
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
