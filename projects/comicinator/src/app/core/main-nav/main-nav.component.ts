import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AppSettingsComponent } from '../../app-settings/app-settings.component';
import { LibraryScannerComponent } from '../../library-scanner/library-scanner.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FileSystemService } from '../file-system.service';
import { ImportBooksComponent } from '../../import-books/import-books.component';
import { SettingsStore } from '../store/settings/settings.store';

@Component({
    selector: 'cbx-main-nav',
    templateUrl: 'main-nav.component.html',
    styleUrl: 'main-nav.component.scss',
    imports: [
        MatButtonModule,
        MatIconModule,
        RouterLink,
        RouterLinkActive,
        MatIcon,
    ],
})
export class MainNavComponent {
    private dialog = inject(MatDialog);
    private fileSystemService = inject(FileSystemService);
    private settingsStore = inject(SettingsStore);

    protected loaded = this.settingsStore.loaded;

    protected openSettings() {
        this.dialog.open(AppSettingsComponent, {
            minWidth: 700,
            disableClose: true,
        });
    }

    protected async scanLibrary() {
        this.dialog.open(LibraryScannerComponent, {
            disableClose: true,
            minWidth: 400,
        });
    }

    protected async importFiles() {
        const files = await this.fileSystemService.openFile(true);

        if (files.length) {
            this.dialog.open(ImportBooksComponent, {
                minWidth: 800,
                data: files,
            });
        }
    }
}
