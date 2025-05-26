import { Component, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

@Component({
    selector: 'cbx-search-bar',
    templateUrl: 'search-bar.component.html',
    styleUrl: 'search-bar.component.scss',
    imports: [MatIconModule, FormsModule],
})
export class SearchBarComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    protected searchValue = signal<string>('');

    protected searchQuery = toSignal(
        this.route.queryParamMap.pipe(map((pMap) => pMap.get('search'))),
    );

    constructor() {
        effect(() => {
            const searchQuery = this.searchQuery() ?? '';

            untracked(() => {
                if (searchQuery !== this.searchValue()) {
                    this.searchValue.set(searchQuery);
                }
            });
        });
    }

    protected back() {
        window.history.back();
    }

    protected search() {
        const searchValue = this.searchValue().trim();

        if (searchValue.length) {
            const [, searchAreaAndQuery] = this.router.url.split('/');
            const [searchArea] = searchAreaAndQuery.split('?');

            this.router.navigateByUrl(`/${searchArea}?search=${searchValue}`);
        }
    }
}
