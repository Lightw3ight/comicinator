// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

const FILE_SYSTEM_METHODS = ['exists', 'getFolderContents', 'openDirectory'];
const SQL_METHODS = ['select', 'selectAll', 'run', 'transaction'];
const ZIP_METHODS = ['readText', 'readData', 'readEntries', 'readXml'];

function createHandlerPassthroughs(prefix: string, names: string[]) {
    return names.reduce(
        (acc, name) => {
            const fnName = `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}`
            return {
                ...acc,
                [fnName]: (...args: any[]) => ipcRenderer.invoke(`${prefix}-${name}`, ...args),
            }
        },
        {}
    )
}

contextBridge.exposeInMainWorld('electron', {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    unzip: (filePath: string) => ipcRenderer.invoke('unzip', filePath),

    ...createHandlerPassthroughs('fs', FILE_SYSTEM_METHODS),
    ...createHandlerPassthroughs('sql', SQL_METHODS),
    ...createHandlerPassthroughs('zip', ZIP_METHODS),

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


