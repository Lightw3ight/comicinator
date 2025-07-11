import { Component, computed, inject, viewChild } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableDataSource,
} from '@angular/material/table';
import { MessagingService } from '../core/messaging/messaging.service';
import { Library } from '../core/models/library.interface';
import { LibraryStore } from '../core/store/library/library.store';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { LibraryFormComponent } from './library-form/library-form.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
    selector: 'cbx-libraries',
    templateUrl: 'libraries.component.html',
    styleUrl: 'libraries.component.scss',
    imports: [
        MatTable,
        MatSort,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderCellDef,
        MatSortHeader,
        MatCell,
        MatCellDef,
        MatHeaderRow,
        MatHeaderRowDef,
        MatRow,
        MatRowDef,
        MatIconButton,
        MatIcon,
        PageHeaderComponent,
        RouterLink,
    ],
})
export class LibrariesComponent {
    private libraryStore = inject(LibraryStore);
    private messagingService = inject(MessagingService);
    private dialog = inject(MatDialog);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    private readonly sort = viewChild(MatSort);
    protected displayedColumns = ['name', 'actions'];
    protected readonly search = this.getSearchFromQuerystring();
    protected readonly libraries = this.computeLibraries();
    protected readonly dataSource = this.computeDataSource();
    protected readonly title = this.computeTitle();

    protected clearSearch() {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { search: undefined },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }

    protected editLibrary(lib: Library) {
        this.dialog.open(LibraryFormComponent, {
            data: lib,
            width: '80%',
            minWidth: 800,
        });
    }

    protected createLibrary() {
        this.dialog.open(LibraryFormComponent, { width: '80%', minWidth: 800 });
    }

    protected async deleteLibrary(lib: Library) {
        const confirmed = await this.messagingService.confirm(
            'Remove library?',
            `Are you sure you want to delete the library ${lib.name}?`,
        );

        if (confirmed) {
            this.libraryStore.remove(lib.id);
        }
    }

    private computeTitle() {
        return computed(() => {
            let title = 'Libraries';
            const search = this.search()?.toLocaleLowerCase();

            if (search) {
                title = `${title} // Search: ${search}`;
            }

            return title;
        });
    }

    private computeDataSource() {
        return computed(() => {
            const dataSource = new MatTableDataSource<Library>(
                this.libraries(),
            );

            const sort = this.sort();
            if (sort) {
                dataSource.sort = sort;
            }
            return dataSource;
        });
    }

    private computeLibraries() {
        return computed(() => {
            const libs = this.libraryStore.entities();
            const search = this.search()?.toLocaleLowerCase();

            if (search == null || search === '') {
                return libs;
            }

            return libs.filter((lib) =>
                lib.name.toLocaleLowerCase().includes(search),
            );
        });
    }

    private getSearchFromQuerystring() {
        return toSignal(
            this.route.queryParamMap.pipe(
                map((pMap) => pMap.get('search') ?? undefined),
            ),
        );
    }
}
