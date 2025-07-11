import { FilterOperator } from './filter-operator.type';

export interface LibraryFilter {
    // id: number;
    // libraryId: number;
    field: string;
    operator: FilterOperator;
    value: any;
}
