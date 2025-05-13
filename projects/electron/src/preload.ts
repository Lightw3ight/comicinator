// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

const FILE_SYSTEM_METHODS = ['exists', 'getFolderContents', 'openDirectory'];
const SQL_METHODS = ['select', 'selectAll', 'transaction'];
const ZIP_METHODS = [
    'readText',
    'readData',
    'readEntries',
    'readXml',
    'readImages',
];

function createHandlerPassthroughs(prefix: string, names: string[]) {
    return names.reduce((acc, name) => {
        const fnName = `${prefix}${name.charAt(0).toUpperCase()}${name.slice(
            1
        )}`;
        return {
            ...acc,
            [fnName]: (...args: any[]) =>
                ipcRenderer.invoke(`${prefix}-${name}`, ...args),
        };
    }, {});
}

// Object.entries(params).forEach(([key, value]) => {
//     if (params[key] instanceof Blob) {

//     }
// })

contextBridge.exposeInMainWorld('electron', {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    unzip: (filePath: string) => ipcRenderer.invoke('unzip', filePath),

    ...createHandlerPassthroughs('fs', FILE_SYSTEM_METHODS),
    ...createHandlerPassthroughs('sql', SQL_METHODS),
    ...createHandlerPassthroughs('zip', ZIP_METHODS),
    sqlRun: async (sql: string, ...args: any[]) => {
        for (let arg of args) {
            if (arg instanceof Object) {
                const entries = Object.entries(arg);

                for (let [key, value] of entries) {
                    if (value instanceof Blob) {
                        const buffer = await value.arrayBuffer();
                        const uint8Array = new Uint8Array(buffer);
                        arg[key] = uint8Array;
                    }
                }
            }
        }
        await ipcRenderer.invoke('sql-run', sql, ...args);
    },

    send: (channel: string, data: any) => {
        ipcRenderer.send(channel, data);
    },
    on: (channel: string, func: (...args: any[]) => void) => {
        const newFunc = (...args: any[]) => func(...args);
        ipcRenderer.on(channel, newFunc);
    },
    sendSync: (channel: string, data: any) => {
        return ipcRenderer.sendSync(channel, data);
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, func);
    },
});
