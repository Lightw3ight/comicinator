import AdmZip from 'adm-zip';
import { importBook } from './import-book';
import { readImages } from './read-images';
import { readXml } from './read-xml';
import { writeXml } from './write-xml';

export function getZipHandlers(thumbPath: string) {
    return {
        async importBook(zipPath: string) {
            return importBook(zipPath, thumbPath);
        },

        async readText(
            zipPath: string,
            fileName: string,
        ): Promise<string | undefined> {
            console.log('Opening zip', zipPath);
            const zip = new AdmZip(zipPath);
            const info = zip.getEntry(fileName);

            if (info) {
                return await new Promise((resolve, reject) => {
                    zip.readAsTextAsync(info, (data, err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
            }

            console.log('unable to find ', fileName);
            return undefined;
        },

        readXml,
        writeXml,
        readImages,

        async readData(
            zipPath: string,
            fileName: string,
        ): Promise<Buffer | undefined> {
            const zip = new AdmZip(zipPath);
            const info = zip.getEntry(fileName);

            if (info) {
                return await new Promise<Buffer>((resolve, reject) => {
                    info.getDataAsync((data, err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
            }

            return undefined;
        },

        readEntries(zipPath: string) {
            const zip = new AdmZip(zipPath);
            zip.getEntries().map((entry) => entry.entryName);
        },
    };
}
