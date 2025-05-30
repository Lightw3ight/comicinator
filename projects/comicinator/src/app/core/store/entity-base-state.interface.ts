import { SortDirection } from '../models/sort-direction.type';

export interface EntityBaseState<T, Tid> {
    sortField: keyof T;
    sortDirection: SortDirection;

    pagesLoaded: { [page: number]: boolean };
    pagedData: Tid[][];

    itemCount: number;
    columnCount: number;

    searchText: string | undefined;
}
