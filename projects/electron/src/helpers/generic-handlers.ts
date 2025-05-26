import { removeThumbCache } from './remove-thumb-cache';

export function getGenericHandlers(thumbPath: string) {
    return {
        removeThumbCache(zipPath: string) {
            return removeThumbCache(zipPath, thumbPath);
        },
    };
}
