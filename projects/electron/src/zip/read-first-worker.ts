import AdmZip from 'adm-zip';

import { parentPort, workerData } from 'worker_threads';

const data: { zipPath: string; fileType: string } = workerData;

const zip = new AdmZip(data.zipPath);

const [first] = zip
    .getEntries()
    .filter((entry) =>
        entry.entryName.toLocaleLowerCase().endsWith(data.fileType)
    );

if (first) {
    const data = first.getData();
    parentPort.postMessage(data);
} else {
    throw new Error(`No image found in zip ${data.zipPath}`);
}
