import { Component, HostListener, inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { ElectronService } from './core/electron.service';
import { SearchBarComponent } from './core/header/search-bar.component';
import { MainNavComponent } from './core/main-nav/main-nav.component';
import { ImportBooksComponent } from './import-books/import-books.component';

@Component({
    selector: 'cbx-app',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, MainNavComponent, SearchBarComponent],
})
export class AppComponent {
    private electron = inject(ElectronService);
    private dialog = inject(MatDialog);

    @HostListener('dragover', ['$event'])
    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow drop
        event.stopPropagation();
    }

    @HostListener('drop', ['$event'])
    onDrop(event: DragEvent) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer?.files ?? []);
        const paths = this.electron.getFilePaths(files);

        const comics = paths.filter((path) =>
            path.toLocaleLowerCase().endsWith('.cbz')
        );

        if (comics.length) {
            this.dialog.open(ImportBooksComponent, {
                minWidth: 900,
                data: comics,
            });
        }
    }
}
