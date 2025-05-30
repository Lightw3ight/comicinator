import { Dictionary } from '../../models/dictionary.interface';
import { LoadState } from '../../models/load-state.enum';
import { Book } from '../../models/book.interface';
import { SortDirection } from '../../models/sort-direction.type';
import { EntityBaseState } from '../entity-base-state.interface';

export interface BooksState extends EntityBaseState<Book, number> {}

export const BOOKS_INITIAL_STATE: BooksState = {
    sortField: 'coverDate',
    sortDirection: 'DESC',
    searchText: undefined,
    pagesLoaded: {},
    pagedData: [],
    itemCount: 0,
    columnCount: 0,
};
