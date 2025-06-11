import { abortImageQueue } from './get-zip-thumbnail';
import { removeThumbCache } from './remove-thumb-cache';

export function getGenericHandlers(thumbPath: string) {
    return {
        removeThumbCache(zipPath: string) {
            return removeThumbCache(zipPath, thumbPath);
        },
        abortImageQueue,
    };
}
