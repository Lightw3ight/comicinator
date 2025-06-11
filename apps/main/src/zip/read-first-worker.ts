import AdmZip from 'adm-zip';

import { parentPort, workerData } from 'worker_threads';

const data: {
    zipPath: string;
    fileType: string | string[];
    thumbName: string | undefined;
} = workerData;

const zip = new AdmZip(data.zipPath);
const fileTypes = Array.isArray(data.fileType)
    ? data.fileType
    : [data.fileType];

const entries = zip
    .getEntries()
    .filter((entry) =>
        fileTypes.some((ft) => entry.entryName.toLocaleLowerCase().endsWith(ft))
    )
    .sort((a, b) => a.entryName.localeCompare(b.entryName));

const thumb =
    (data.thumbName
        ? entries.find((o) => o.entryName === data.thumbName)
        : entries[0]) ?? entries[0];

if (thumb) {
    const data = thumb.getData();
    parentPort?.postMessage(data);
} else {
    throw new Error(`No image found in zip ${data.zipPath}`);
}
