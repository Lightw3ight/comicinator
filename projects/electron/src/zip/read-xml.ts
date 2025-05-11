import path from 'path';
import { executeWorker } from '../helpers/execute-worker';

export async function readXml(zipPath: string, fileName: string) {
    const workerPath = path.join(__dirname, 'read-xml-worker.js');

    return await executeWorker<string[]>(workerPath, {
        zipPath,
        fileName,
    });
}
