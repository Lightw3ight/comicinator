export interface SelectOptions<T> {
    filter?: string;
    sortField?: keyof T;
    sortDirection?: 'ASC' | 'DESC';
    offset: number;
    limit: number;
}
