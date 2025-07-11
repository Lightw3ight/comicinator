import { Routes } from '@angular/router';
import { BooksComponent } from './books/books.component';
import { BookComponent } from './books/book/book.component';
import { CharactersComponent } from './characters/characters.component';
import { CharacterComponent } from './characters/character/character.component';
import { TeamsComponent } from './teams/teams.component';
import { TeamComponent } from './teams/team/team.component';
import { GroupComponent } from './books/group/group.component';
import { LocationsComponent } from './locations/locations.component';
import { LocationComponent } from './locations/location/location.component';

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
        path: 'books/library/:libraryId',
        component: BooksComponent,
    },
    {
        path: 'books/group/:groupField/:groupValue',
        component: GroupComponent,
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
    {
        path: 'locations',
        component: LocationsComponent,
    },
    {
        path: 'locations/:id',
        component: LocationComponent,
    },
    {
        path: 'libraries',
        loadChildren: () =>
            import('./libraries/libraries.routes').then(
                (o) => o.LIBRARIES_ROUTES,
            ),
    },
];
