import AdmZip from 'adm-zip';

import { parentPort, workerData } from 'worker_threads';
import { parseString } from 'xml2js';
import { generateThumb } from './generate-thumb';

const args: { zipPath: string; thumbPath: string } = workerData;
const XML_FILE_NAME = 'ComicInfo.xml';

const zip = new AdmZip(args.zipPath);

function loadComicInfo() {
    const info = zip.getEntry(XML_FILE_NAME);
    if (info) {
        console.log(`Reading ComicInfo.xml from for ${args.zipPath}`);
        const xml = zip.readAsText(info);

        parseString(xml, { explicitArray: false }, (err, result) => {
            if (err) {
                throw err;
            } else {
                parentPort?.postMessage(result?.ComicInfo);
            }
        });
    } else {
        parentPort?.postMessage(undefined);
    }
}

const [firstImage] = zip
    .getEntries()
    .filter((entry) => entry.entryName.toLocaleLowerCase().endsWith('jpg'));

if (firstImage) {
    const thumbData = firstImage.getData();
    console.log(`Generating image for ${args.zipPath}`);
    generateThumb(args.zipPath, args.thumbPath, thumbData).finally(
        loadComicInfo
    );
} else {
    loadComicInfo();
}
