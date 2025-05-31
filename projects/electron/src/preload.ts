// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

const FILE_SYSTEM_METHODS = [
    'exists',
    'getFolderContents',
    'openDirectory',
    'openFile',
    'moveFile',
    'showItemInFolder',
];
const ZIP_METHODS = [
    'readText',
    'readData',
    'readEntries',
    'readXml',
    'writeXml',
    'readImages',
    'importBook',
];
const GENERIC_METHODS = ['removeThumbCache', 'abortImageQueue'];

const CHARACTER_METHODS = [
    'selectMany',
    'selectManyCount',
    'create',
    'update',
    'remove',
    'selectByBook',
    'selectByTeam',
    'selectById',
    'selectImage',
    'selectByIds',
    'findForImport',
];

const TEAM_METHODS = [
    'selectMany',
    'selectManyCount',
    'create',
    'update',
    'remove',
    'selectByBook',
    'selectByCharacter',
    'selectById',
    'selectImage',
    'findForImport',
    'selectByIds',
];

const LOCATION_METHODS = [
    'selectMany',
    'selectManyCount',
    'create',
    'update',
    'remove',
    'selectByBook',
    'selectById',
    'selectImage',
    'findForImport',
    'selectByIds',
];

const PUBLISHER_METHODS = [
    'selectAll',
    'update',
    'create',
    'remove',
    'search',
    'startsWith',
    'selectById',
    'selectImage',
    'findForImport',
];

const BOOK_METHODS = [
    'setReadDetails',
    'selectById',
    'selectMany',
    'search',
    'startsWith',
    'update',
    'create',
    'remove',
    'selectByCharacter',
    'selectByTeam',
    'selectByLocation',
    'selectGrouped',
    'selectGroupedCount',
    'selectByGroup',
    'selectByFilePath',
    'selectManyCount',
];

const SETTING_METHODS = ['selectAll', 'saveAll'];

function createHandlerPassthroughs(prefix: string, names: string[]) {
    return names.reduce((acc, name) => {
        const fnName = `${prefix}${name.charAt(0).toUpperCase()}${name.slice(
            1,
        )}`;
        return {
            ...acc,
            [fnName]: (...args: any[]) =>
                ipcRenderer.invoke(`${prefix}-${name}`, ...args),
        };
    }, {});
}

contextBridge.exposeInMainWorld('electron', {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    unzip: (filePath: string) => ipcRenderer.invoke('unzip', filePath),

    ...createHandlerPassthroughs('book', BOOK_METHODS),
    ...createHandlerPassthroughs('pub', PUBLISHER_METHODS),
    ...createHandlerPassthroughs('setting', SETTING_METHODS),
    ...createHandlerPassthroughs('loc', LOCATION_METHODS),
    ...createHandlerPassthroughs('team', TEAM_METHODS),
    ...createHandlerPassthroughs('char', CHARACTER_METHODS),
    ...createHandlerPassthroughs('fs', FILE_SYSTEM_METHODS),
    ...createHandlerPassthroughs('zip', ZIP_METHODS),
    ...createHandlerPassthroughs('cbx', GENERIC_METHODS),
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
        return await ipcRenderer.invoke('sql-run', sql, ...args);
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
