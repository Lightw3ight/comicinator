export interface FieldFilter<T> {
    field: keyof T;
    value: any;
    operator: '=' | '>=' | '<=' | '<' | '>' | 'like';
}
