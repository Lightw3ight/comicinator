import path from 'path';
import { executeWorker } from '../helpers/execute-worker';

export async function writeXml(
    zipPath: string,
    fileName: string,
    data: object
) {
    const workerPath = path.join(__dirname, 'write-xml-worker.js');

    return await executeWorker<string[]>(workerPath, {
        zipPath,
        fileName,
        data,
    });
}
