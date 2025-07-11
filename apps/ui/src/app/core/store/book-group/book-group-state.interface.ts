import { Book } from '../../models/book.interface';
import { EntityBaseState } from '../entity-base-state.interface';

export interface BookGroupState extends EntityBaseState<Book, string> {
    groupField: keyof Book | undefined;
    activeGroup: string | undefined;
    activeGroupBooks: number[];
    libraryId: number | undefined;
}

export const BOOK_GROUP_INITIAL_STATE: BookGroupState = {
    libraryId: undefined,
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
