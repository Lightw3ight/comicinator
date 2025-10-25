import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppSettingsComponent } from '../../app-settings/app-settings.component';
import { ImportBooksComponent } from '../../import-books/import-books.component';
import { LibraryScannerComponent } from '../../library-scanner/library-scanner.component';
import { FileSystemService } from '../file-system.service';
import { LibraryStore } from '../store/library/library.store';
import { SettingsStore } from '../store/settings/settings.store';
import { RadarListComponent } from './followed-list/radar-list.component';
import { LastReadListComponent } from './last-read-list/last-read-list.component';
import { NavListItemComponent } from './nav-list/nav-list-item/nav-list-item.component';
import { NavListComponent } from './nav-list/nav-list.component';

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
        LastReadListComponent,
        RadarListComponent,
        NavListComponent,
        NavListItemComponent,
    ],
})
export class MainNavComponent {
    private dialog = inject(MatDialog);
    private fileSystemService = inject(FileSystemService);
    private settingsStore = inject(SettingsStore);
    protected libraryStore = inject(LibraryStore);

    protected loaded = this.settingsStore.loaded;
    protected libraries = this.libraryStore.quickList;

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
            const ref = this.dialog.open(ImportBooksComponent, {
                minWidth: 900,
                data: files,
            });

            await firstValueFrom(ref.afterClosed());
        }
    }
}
