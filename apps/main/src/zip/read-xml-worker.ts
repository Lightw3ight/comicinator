import AdmZip from 'adm-zip';

import { parentPort, workerData } from 'worker_threads';
import { parseString } from 'xml2js';

const data: { zipPath: string; fileName: string } = workerData;

const zip = new AdmZip(data.zipPath);
const info = zip.getEntry(data.fileName);

if (info) {
    const xml = zip.readAsText(info);

    parseString(xml, { explicitArray: false }, (err, result) => {
        if (err) {
            throw err;
        } else {
            parentPort?.postMessage(result);
        }
    });
} else {
    parentPort?.postMessage(undefined);
}
