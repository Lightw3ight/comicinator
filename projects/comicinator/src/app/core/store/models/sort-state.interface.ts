import { SortDirection } from '../../models/sort-direction.type';

export interface SortState<T> {
    sortField?: keyof T;
    sortDirection?: SortDirection;
}
