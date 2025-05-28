import { Component, inject, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { ComicVineService } from './core/api/comic-vine/comic-vine-api.service';
import { SearchBarComponent } from './core/header/search-bar.component';
import { MainNavComponent } from './core/main-nav/main-nav.component';
import { LibraryScannerComponent } from './library-scanner/library-scanner.component';
import { CharactersApiService } from './core/api/characters/characters-api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, MainNavComponent, SearchBarComponent],
})
export class AppComponent implements OnInit {
    protected sanitizer = inject(DomSanitizer);
    private dialog = inject(MatDialog);
    private characterApiService = inject(CharactersApiService);

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

    public async ngOnInit() {
        const result = await this.characterApiService.findForImport(
            0,
            'carla Addison',
        );
        console.log('RESULT', result);
    }
}
