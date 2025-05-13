import { Routes } from '@angular/router';
import { BooksComponent } from './books/books.component';
import { BookComponent } from './books/book/book.component';
import { CharactersComponent } from './characters/characters.component';
import { CharacterComponent } from './characters/character/character.component';
import { TeamsComponent } from './teams/teams.component';
import { TeamComponent } from './teams/team/team.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/books',
        pathMatch: 'full',
    },
    {
        path: 'books',
        component: BooksComponent,
    },
    {
        path: 'books/:id',
        component: BookComponent,
    },
    {
        path: 'characters',
        component: CharactersComponent,
    },
    {
        path: 'characters/:id',
        component: CharacterComponent,
    },
    {
        path: 'teams',
        component: TeamsComponent,
    },
    {
        path: 'teams/:id',
        component: TeamComponent,
    },
];
