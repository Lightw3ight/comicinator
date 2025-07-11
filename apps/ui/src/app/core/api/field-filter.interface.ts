import { FilterOperator } from '../models/filter-operator.type';

export interface FieldFilter<T> {
    field: keyof T;
    value: any;
    operator: FilterOperator;
}
