import path from 'path';
import { executeWorker } from '../helpers/execute-worker';

export async function importBook(zipPath: string, thumbPath: string) {
    const workerPath = path.join(__dirname, 'import-book-worker.js');

    return await executeWorker<string[]>(workerPath, {
        zipPath,
        thumbPath,
    });
}
