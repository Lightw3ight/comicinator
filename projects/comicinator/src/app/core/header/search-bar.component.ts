import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'cbx-search-bar',
    templateUrl: 'search-bar.component.html',
    styleUrl: 'search-bar.component.scss',
    imports: [MatIconModule, FormsModule],
})
export class SearchBarComponent {
    private router = inject(Router);
    protected searchValue = signal<string>('');

    protected back() {
        window.history.back();
    }

    protected search() {
        const searchValue = this.searchValue().trim();

        if (searchValue.length) {
            this.searchValue.set('');

            const [, searchAreaAndQuery] = this.router.url.split('/');
            const [searchArea] = searchAreaAndQuery.split('?');

            this.router.navigateByUrl(`/${searchArea}?search=${searchValue}`);
        }
    }
}
