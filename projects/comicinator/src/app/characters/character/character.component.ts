import {
    Component,
    computed,
    effect,
    inject,
    input,
    numberAttribute,
    OnInit,
    untracked,
} from '@angular/core';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { BooksStore } from '../../core/store/books/books.store';
import { BookListComponent } from '../../books/book-list/book-list.component';

@Component({
    selector: 'cbx-character',
    templateUrl: 'character.component.html',
    styleUrl: 'character.component.scss',
    imports: [BookListComponent],
})
export class CharacterComponent {
    private charactersStore = inject(CharactersStore);
    private booksStore = inject(BooksStore);

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

    private computeCharacter() {
        return computed(() => {
            const id = this.id();
            return this.charactersStore.entityMap()[id];
        });
    }
}
