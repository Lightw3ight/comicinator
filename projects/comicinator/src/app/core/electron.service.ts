import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';


@Injectable({providedIn: 'root'})
export class ElectronService {
    // public fs: typeof fs = (window as any)['fs'];
    private electron: any = (window as any)['electron'];

    public async readFile(filePath: string) {
        return this.electron.readFile(filePath);
    }

    public async unzip(filePath: string) {
        return this.electron.unzip(filePath);
    }

    // constructor() {
    //     if (this.isElectron()) {
    //         this.fs = window.require('fs');
    //     }
    // }
    
    // public isElectron = () => {
    //     return window && window.process// && window.process.type;
    // };
}