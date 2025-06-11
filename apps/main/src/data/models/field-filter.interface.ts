export interface FieldFilter<T = any> {
    field: keyof T;
    value: any;
    operator: '=' | '>=' | '<=' | '<' | '>' | 'like';
}
