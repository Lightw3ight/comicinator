import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { SearchBarComponent } from './core/header/search-bar.component';
import { MainNavComponent } from './core/main-nav/main-nav.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, MainNavComponent, SearchBarComponent],
})
export class AppComponent {}
