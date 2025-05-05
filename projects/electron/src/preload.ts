// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// import * as fs from 'fs';

// contextBridge.exposeInMainWorld('fs', fs);

contextBridge.exposeInMainWorld('electron', {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    unzip: (filePath: string) => ipcRenderer.invoke('unzip', filePath),

    sqlInsert: (sql: string, params: any[]) => ipcRenderer.invoke('sql-insert', sql, params),
    sqlSelectAll: (sql: string, params: any[]) => ipcRenderer.invoke('sql-select-all', sql, params),
    sqlSelect: (sql: string, params: any[]) => ipcRenderer.invoke('sql-select', sql, params),

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
