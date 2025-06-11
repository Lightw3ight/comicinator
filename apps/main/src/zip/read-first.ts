import path from 'path';
import { executeWorker } from '../helpers/execute-worker';

export async function readFirst(
    zipPath: string,
    thumbName: string | undefined,
    fileType: string | string[],
) {
    const workerPath = path.join(__dirname, 'read-first-worker.js');

    return await executeWorker<Buffer<ArrayBufferLike>>(workerPath, {
        zipPath,
        thumbName,
        fileType,
    });
}
