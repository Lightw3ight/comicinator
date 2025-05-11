import AdmZip from 'adm-zip';
// import sharp from 'sharp';
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

    return undefined;
}

const firstImage = readFirst(data.zipPath, '.jpg');

if (firstImage) {
    firstImage.then(val => {
        parentPort.postMessage(val);
    }).catch(err => {
        parentPort.postMessage('error');
    })
} else {
    parentPort.postMessage('error');
}

// if (firstImage) {
//     firstImage
//         .then((imageBuffer) => {
//             sharp(imageBuffer)
//                 .resize({ withoutEnlargement: true, width: 300 })
//                 .jpeg({ quality: 80 })
//                 .toFile(data.thumbPath)
//                 .then(() => {
//                     parentPort.postMessage('success');
//                 })
//                 .catch(() => {
//                     parentPort.postMessage('error');
//                 });
//         })
//         .catch(() => {
//             parentPort.postMessage('error');
//         });
// } else {
//     parentPort.postMessage('error');
// }
