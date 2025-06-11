import path from 'path';
import sharp from 'sharp';
import { hashString } from '../helpers/hash-string';

export async function generateThumb(
    zipPath: string,
    cachePath: string,
    data: Buffer<ArrayBufferLike>,
) {
    const hash = hashString(zipPath);
    const thumbPath = path.join(cachePath, `${hash}.jpg`);

    await sharp(data)
        .resize({ withoutEnlargement: true, width: 300 })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);

    return thumbPath;
}
