import AdmZip from 'adm-zip';

import { parentPort, workerData } from 'worker_threads';

const data: { zipPath: string; fileType: string | string[] } = workerData;

const zip = new AdmZip(data.zipPath);
const fileTypes = Array.isArray(data.fileType)
    ? data.fileType
    : [data.fileType];

const [first] = zip
    .getEntries()
    .filter((entry) =>
        fileTypes.some((ft) =>
            entry.entryName.toLocaleLowerCase().endsWith(ft),
        ),
    );

if (first) {
    const data = first.getData();
    parentPort.postMessage(data);
} else {
    throw new Error(`No image found in zip ${data.zipPath}`);
}
