import { BookGroup } from '../../models/book-group.interface';
import { Book } from '../../models/book.interface';
import { Dictionary } from '../../models/dictionary.interface';
import { FilterOperator } from '../../models/filter-operator.type';

export interface BookGroupState {
    groupField: keyof Book | undefined;
    groups: BookGroup[];
    groupBooks: Dictionary<number[]>;
    search: string | undefined;
    searchOperator: FilterOperator;
}

export const BOOK_GROUP_INITIAL_STATE: BookGroupState = {
    groupField: undefined,
    groups: [],
    groupBooks: {},
    search: undefined,
    searchOperator: 'starts-with',
};
