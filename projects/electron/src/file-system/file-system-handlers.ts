import { BaseWindow, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { executeWorker } from '../helpers/execute-worker';
import { LazyValue } from '../helpers/lazy-value';

export function getFileSystemMethods(baseWindow: LazyValue<BaseWindow>) {
    return {
        async exists(path: string) {
            try {
                await fs.promises.access(path);
            } catch (er) {
                console.log('access error', er);
                return false;
            }

            return true;
        },

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
    };
}
