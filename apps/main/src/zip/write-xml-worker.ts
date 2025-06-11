import AdmZip from 'adm-zip';

import { parentPort, workerData } from 'worker_threads';
import { Builder } from 'xml2js';

const data: { zipPath: string; fileName: string; data: object } = workerData;

const builder = new Builder();
const xml = builder.buildObject(data.data);

const zip = new AdmZip(data.zipPath);

const existing = zip.getEntry(data.fileName);

if (existing) {
    zip.deleteFile(existing);
}

zip.addFile(data.fileName, Buffer.from(xml, 'utf8'));

zip.writeZip(data.zipPath, (err) => {
    if (err) {
        throw err;
    } else {
        parentPort?.postMessage(true);
    }
});
