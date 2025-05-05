import { Component, inject, OnInit } from '@angular/core';
import { ElectronService } from './core/electron.service';

import { Buffer } from 'buffer';
import { BookApiService } from './core/api/book-api.service';
import { ComicVineService } from './core/api/comic-vine-api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    private bookApiService = inject(BookApiService);
    private comicVineService = inject(ComicVineService);

    title = 'comicinator';
    public imgSrc: string = '';

    public async ngOnInit() {
        console.log('Hello');
        // const zip: any = await this.electronService.unzip(
        //     'C:\\Development\\comicinator\\files\\Aquamen 002.cbz'
        // );
        // const thing = await this.electronService.readFile(
        //     `C:\\Development\\comicinator\\files\\Aquamen 002.cbz`
        // );
        // console.log('the svc', thing);

        // const zip = new AdmZip(thing);

        // const image = new Blob([zip], { type: 'image/jpeg' });
        // this.imgSrc = URL.createObjectURL(image);
    }

    protected async loadComics() {
        const results = await this.comicVineService.searchIssues('batman');
        console.log('search results', results);
    }

    protected async createBook() {
        const newBook = await this.bookApiService.insertBook({
            filePath: 'C:\\Development\\comicinator\\files\\Aquamen 002.cbz',
            title: 'Aquamen 002',
            series: 'Aquamen',
            number: 2,
            volume: 1,
            summary: 'The second issue of Aquamen.',
            notes: 'Some notes about the book.',
            year: 2021,
            month: 5,
            day: 15,
            writer: 'Writer Name',
            penciler: 'Penciler Name',
            inker: 'Inker Name',
            colorist: 'Colorist Name',
            letterer: 'Letterer Name',
            coverArtist: 'Cover Artist Name',
            editor: 'Editor Name',
            publisher: 'Publisher Name',
            pageCount: 32,
            fileSize: 2048000,
        });
        console.log('newBook', newBook);

        const books = await this.bookApiService.selectBooks();
        console.log('books', books);
    }
}
