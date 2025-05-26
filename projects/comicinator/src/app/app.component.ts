import { Component, inject, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { ComicVineService } from './core/api/comic-vine/comic-vine-api.service';
import { SearchBarComponent } from './core/header/search-bar.component';
import { MainNavComponent } from './core/main-nav/main-nav.component';
import { LibraryScannerComponent } from './library-scanner/library-scanner.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, MainNavComponent, SearchBarComponent],
})
export class AppComponent implements OnInit {
    protected sanitizer = inject(DomSanitizer);
    readonly dialog = inject(MatDialog);

    protected filePath = `zip-thumb://${encodeURIComponent(
        'C:/Development/Absolute Batman 001 (2024).cbz'
    )}`;

    protected openSettings() {
        this.dialog.open(AppSettingsComponent, {
            minWidth: 400,
            disableClose: true,
        });
    }

    protected async scanLibrary() {
        this.dialog.open(LibraryScannerComponent, {
            disableClose: true,
            minWidth: 400,
        });
    }

    title = 'comicinator';
    public imgSrc: string = '';

    public async ngOnInit() {
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

    // protected async loadComics() {
    //     const results = await this.comicVineService.searchIssues('batman');
    //     console.log('search results', results);
    // }

    // protected async createBook() {
    //     const newBook = await this.bookApiService.insertBook({
    //         filePath: 'C:\\Development\\comicinator\\files\\Aquamen 002.cbz',
    //         title: 'Aquamen 002',
    //         series: 'Aquamen',
    //         number: 2,
    //         volume: 1,
    //         summary: 'The second issue of Aquamen.',
    //         notes: 'Some notes about the book.',
    //         year: 2021,
    //         month: 5,
    //         day: 15,
    //         writer: 'Writer Name',
    //         penciler: 'Penciler Name',
    //         inker: 'Inker Name',
    //         colorist: 'Colorist Name',
    //         letterer: 'Letterer Name',
    //         coverArtist: 'Cover Artist Name',
    //         editor: 'Editor Name',
    //         publisher: 'Publisher Name',
    //         pageCount: 32,
    //         fileSize: 2048000,
    //     });
    //     console.log('newBook', newBook);

    //     const books = await this.bookApiService.selectBooks();
    //     console.log('books', books);
    // }
}
