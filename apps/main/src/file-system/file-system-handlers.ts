import { BrowserWindow, dialog, shell } from 'electron';
import mv from 'mv';
import path from 'path';
import { executeWorker } from '../helpers/execute-worker';
import { LazyValue } from '../helpers/lazy-value';
import { exists } from './exists';

export function getFileSystemMethods(baseWindow: LazyValue<BrowserWindow>) {
    return {
        exists,

        async getFolderContents(filePath: string, recursive = false) {
            const workerPath = path.join(
                __dirname,
                'get-folder-contents-worker.js'
            );
            return await executeWorker<string[]>(workerPath, {
                filePath,
                recursive,
            });
        },

        async openDirectory(defaultPath: string): Promise<string> {
            const { filePaths } = await dialog.showOpenDialog(baseWindow(), {
                defaultPath,
                properties: ['openDirectory', 'createDirectory'],
            });
            return filePaths[0];
        },

        async openFile(multiple = false): Promise<string[]> {
            const { filePaths } = await dialog.showOpenDialog(baseWindow(), {
                properties: multiple
                    ? ['openFile', 'multiSelections']
                    : ['openFile'],
            });

            return filePaths;
        },

        async moveFile(source: string, destination: string) {
            if (await exists(destination)) {
                throw new Error(`File already exists: ${destination}`);
            }

            return await new Promise<void>((resolve, reject) => {
                mv(
                    source,
                    destination,
                    { clobber: false, mkdirp: true },
                    (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        },

        showItemInFolder(filePath: string) {
            shell.showItemInFolder(filePath);
        },
    };
}
