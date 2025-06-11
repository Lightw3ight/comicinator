import path from 'path';
import { executeWorker } from '../helpers/execute-worker';

export async function readImages(zipPath: string) {
    const workerPath = path.join(__dirname, 'read-images-worker.js');

    return await executeWorker<string[]>(workerPath, {
        zipPath,
    });
}
