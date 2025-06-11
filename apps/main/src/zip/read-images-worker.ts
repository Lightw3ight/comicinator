import AdmZip from 'adm-zip';
import { isImage } from '../helpers/is-jpg';

import { parentPort, workerData } from 'worker_threads';

const data: { zipPath: string } = workerData;

const zip = new AdmZip(data.zipPath);

const images = zip
    .getEntries()
    .filter((o) => isImage(o.entryName))
    .map((o) => ({ entryName: o.entryName, image: o.getData() }));

parentPort?.postMessage(images);
