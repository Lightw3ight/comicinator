import { Book } from '../../models/book.interface';
import { UserBookState } from '../../models/user-book-state.interface';
import { EntityBaseState } from '../entity-base-state.interface';

export interface BooksState extends EntityBaseState<Book, number> {
    lastBookImport: Date | undefined;
    libraryId: number | undefined;
    userBookState: UserBookState[];
    allFollowedSeries: string[];
    visibleFollowedSeries: string[];
}

export const BOOKS_INITIAL_STATE: BooksState = {
    lastBookImport: undefined,
    sortField: 'coverDate',
    sortDirection: 'DESC',
    searchText: undefined,
    pagesLoaded: {},
    pagedData: [],
    itemCount: 0,
    columnCount: 0,
    libraryId: undefined,
    userBookState: [],
    allFollowedSeries: [],
    visibleFollowedSeries: [],
};
