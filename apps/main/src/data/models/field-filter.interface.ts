import { FilterOperator } from './filter-operator.type';

export interface FieldFilter<T = any> {
    field: keyof T;
    value: any;
    operator: FilterOperator; //'=' | '>=' | '<=' | '<' | '>' | 'like';
}
