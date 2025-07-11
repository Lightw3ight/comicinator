import { FieldFilter } from './field-filter.interface';

export interface SelectOptions<T = any> {
    filter?: string;
    filters?: FieldFilter<T>[];
    sortField?: keyof T;
    matchSome?: boolean;
    sortDirection?: 'ASC' | 'DESC';
    offset: number;
    limit: number;
}
