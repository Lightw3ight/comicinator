import { SortDirection } from '../models/sort-direction.type';
import { FieldFilter } from './field-filter.interface';

export interface SelectOptions<T> {
    filter?: string;
    filters?: FieldFilter<T>[];
    sortField?: keyof T;
    sortDirection?: SortDirection;
    offset?: number;
    limit?: number;
}
