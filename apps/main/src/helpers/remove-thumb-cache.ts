import fs from 'fs';
import path from 'path';
import { hashString } from './hash-string';

export async function removeThumbCache(zipPath: string, thumbsPath: string) {
    const hash = hashString(zipPath);
    const thumbPath = path.join(thumbsPath, `${hash}.jpg`);

    try {
        console.log('unlinking', thumbPath);
        await fs.promises.unlink(thumbPath);
    } catch {
        console.warn(`No thumbnail cache exists for ${zipPath}`);
    }
}
