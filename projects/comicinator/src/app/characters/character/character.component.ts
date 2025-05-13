import {
    Component,
    computed,
    effect,
    inject,
    input,
    numberAttribute,
    untracked,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BookListComponent } from '../../books/book-list/book-list.component';
import { BooksStore } from '../../core/store/books/books.store';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { CharacterFormComponent } from '../character-form/character-form.component';
import { MatDialog } from '@angular/material/dialog';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';

@Component({
    selector: 'cbx-character',
    templateUrl: 'character.component.html',
    styleUrl: 'character.component.scss',
    imports: [BookListComponent, MatButton, IconButtonComponent],
})
export class CharacterComponent {
    private charactersStore = inject(CharactersStore);
    private booksStore = inject(BooksStore);
    private dialog = inject(MatDialog);

    public id = input.required({ transform: numberAttribute });

    protected character = this.computeCharacter();
    protected books = this.booksStore.searchResults;

    constructor() {
        effect(() => {
            const charId = this.id();

            untracked(() => {
                this.booksStore.searchByCharacter(charId);
            });
        });
    }

    public edit() {
        this.dialog.open(CharacterFormComponent, { data: this.id() });
    }

    private computeCharacter() {
        return computed(() => {
            const id = this.id();
            return this.charactersStore.entityMap()[id];
        });
    }
}
