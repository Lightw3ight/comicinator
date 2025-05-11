import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AppSettingsComponent } from '../../app-settings/app-settings.component';
import { LibraryScannerComponent } from '../../library-scanner/library-scanner.component';
import {MatIconModule} from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'cbx-main-nav',
    templateUrl: 'main-nav.component.html',
    styleUrl: 'main-nav.component.scss',
    imports: [MatButtonModule, MatIconModule, RouterLink, RouterLinkActive]
})

export class MainNavComponent {
    readonly dialog = inject(MatDialog);
    
    protected openSettings() {
        this.dialog.open(AppSettingsComponent, { minWidth: 400, disableClose: true });
    }

    protected async scanLibrary() {
        this.dialog.open(LibraryScannerComponent, { disableClose: true, minWidth: 400 });
    }
}