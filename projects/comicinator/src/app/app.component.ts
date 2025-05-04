import { Component, inject, OnInit } from '@angular/core';
import { ElectronService } from './core/electron.service';

import { Buffer} from 'buffer';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    private electronService = inject(ElectronService);
    title = 'comicinator';
    public imgSrc: string = '';

    public async ngOnInit() {
        const zip: any = await this.electronService.unzip(
            'C:\\Development\\comicinator\\files\\Aquamen 002.cbz'
        );
        // const thing = await this.electronService.readFile(
        //     `C:\\Development\\comicinator\\files\\Aquamen 002.cbz`
        // );
        // console.log('the svc', thing);

        // const zip = new AdmZip(thing);

        const image = new Blob([zip], { type: 'image/jpeg' });
        this.imgSrc = URL.createObjectURL(image);
    }
}
