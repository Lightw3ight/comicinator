import { Component, inject } from '@angular/core';
import { BooksStore } from '../../store/books/books.store';
import { NavListItemComponent } from '../nav-list/nav-list-item/nav-list-item.component';
import { NavListComponent } from '../nav-list/nav-list.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
    selector: 'cbx-followed-list',
    templateUrl: 'followed-list.component.html',
    styleUrl: 'followed-list.component.scss',
    imports: [NavListComponent, NavListItemComponent, MatIcon, MatIconButton],
})
export class FollowedListComponent {
    private readonly bookStore = inject(BooksStore);

    public readonly followedSeries = this.bookStore.visibleFollowedSeries;

    protected refresh() {
        this.bookStore.loadFollowedSeries();
    }
}
