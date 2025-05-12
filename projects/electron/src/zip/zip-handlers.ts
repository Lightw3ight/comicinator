import AdmZip from 'adm-zip';
import {parseStringPromise} from 'xml2js';
import { readXml } from './read-xml';
import { readImages } from './read-images';

export const ZIP_HANDLERS = {
    async readText(
        zipPath: string,
        fileName: string
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
    readImages,

    // async readXml(zipPath: string, fileName: string): Promise<Object | undefined> {
    //     console.log('Opening zip', zipPath);
    //     const zip = new AdmZip(zipPath);
    //     const info = zip.getEntry(fileName);

    //     if (info) {
    //         const text = await new Promise<string>((resolve, reject) => {
    //             zip.readAsTextAsync(info, (data, err) => {
    //                 if (err) {
    //                     reject(err);
    //                 } else {
    //                     resolve(data);
    //                 }
    //             });
    //         });

    //         // const parser = new XMLParser();
    //         // return parser.parse(text);
    //         return await parseStringPromise(text, { explicitArray: false });
    //     }

    //     console.log('unable to find ', fileName);
    //     return undefined;
    // },

    async readData(
        zipPath: string,
        fileName: string
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
