import { Book } from '../../core/models/book.interface';
import { Dictionary } from '../../core/models/dictionary.interface';
import { FilterOperator } from '../../core/models/filter-operator.type';

export interface FilterFieldOptions {
    field: keyof Book;
    displayName: string;
    allowedOperators: FilterOperator[];
    formField: FilterFormFieldType;
}

const STRING_OPERATORS: FilterOperator[] = [
    'eq',
    'ne',
    'contains',
    'ends',
    'starts',
    'not-starts',
    'not-ends',
];
const DATE_OPERATORS: FilterOperator[] = ['eq', 'ne', 'gt', 'lt'];

export type FilterFormFieldType = 'text' | 'date' | 'publisher';

export const FILTER_FIELD_OPTIONS: Dictionary<FilterFieldOptions> = {
    series: {
        field: 'series',
        displayName: 'Series',
        allowedOperators: STRING_OPERATORS,
        formField: 'text',
    },
    title: {
        field: 'title',
        displayName: 'Title',
        allowedOperators: STRING_OPERATORS,
        formField: 'text',
    },
    publisherId: {
        field: 'publisherId',
        displayName: 'Publisher',
        allowedOperators: ['eq', 'ne'],
        formField: 'publisher',
    },
    coverDate: {
        field: 'coverDate',
        displayName: 'Cover date',
        allowedOperators: DATE_OPERATORS,
        formField: 'date',
    },
};
