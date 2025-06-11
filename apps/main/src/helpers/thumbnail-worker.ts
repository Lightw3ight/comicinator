import AdmZip from 'adm-zip';
import { parentPort, workerData } from 'worker_threads';

const data: { zipPath: string; thumbPath: string; fallbackImagePath: string } =
    workerData;

export function readFirst(
    zipPath: string,
    fileType: string
): Promise<Buffer | undefined> {
    const zip = new AdmZip(zipPath);
    const [first] = zip
        .getEntries()
        .filter((entry) =>
            entry.entryName.toLocaleLowerCase().endsWith(fileType)
        );

    if (first) {
        return new Promise<Buffer>((resolve, reject) => {
            first.getDataAsync((data, err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    return Promise.resolve(undefined);
}

const firstImage = readFirst(data.zipPath, '.jpg');

if (firstImage) {
    firstImage
        .then((val) => {
            parentPort?.postMessage(val);
        })
        .catch((err) => {
            parentPort?.postMessage('error');
        });
} else {
    parentPort?.postMessage('error');
}
