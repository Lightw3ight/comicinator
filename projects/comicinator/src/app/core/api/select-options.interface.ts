import { SortDirection } from '../models/sort-direction.type';

export interface SelectOptions<T> {
    filter?: string;
    sortField?: keyof T;
    sortDirection?: SortDirection;
    offset?: number;
    limit?: number;
}
