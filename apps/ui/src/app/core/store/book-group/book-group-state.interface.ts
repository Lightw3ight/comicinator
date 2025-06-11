import { BookGroup } from '../../models/book-group.interface';
import { Book } from '../../models/book.interface';
import { Dictionary } from '../../models/dictionary.interface';
import { FilterOperator } from '../../models/filter-operator.type';
import { EntityBaseState } from '../entity-base-state.interface';

// export interface BookGroupState  extends EntityBaseState<Book, number> {
//     groupField: keyof Book | undefined;
//     groups: BookGroup[];
//     groupBooks: Dictionary<number[]>;
//     search: string | undefined;
//     searchOperator: FilterOperator;
// }

export interface BookGroupState extends EntityBaseState<Book, string> {
    groupField: keyof Book | undefined;
    activeGroup: string | undefined;
    activeGroupBooks: number[];
}

export const BOOK_GROUP_INITIAL_STATE: BookGroupState = {
    groupField: undefined,
    activeGroup: undefined,
    sortField: 'coverDate',
    sortDirection: 'DESC',
    searchText: undefined,
    pagesLoaded: {},
    pagedData: [],
    itemCount: 0,
    columnCount: 0,
    activeGroupBooks: [],
};
