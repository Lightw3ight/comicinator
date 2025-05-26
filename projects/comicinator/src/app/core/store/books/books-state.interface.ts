import { BookGroup } from '../../models/book-group.interface';
import { Book } from '../../models/book.interface';
import { Dictionary } from '../../models/dictionary.interface';

export interface BooksState {
    loaded: boolean;
    paths: Dictionary<boolean>;
    searchResultIds: number[];
    activeGroupField: string | undefined;
    activeGroups: BookGroup[];
    activeGroupedBookIds: number[];

    activeSearch: { query: string | undefined; results: number[] };
}

export const BOOKS_INITIAL_STATE: BooksState = {
    loaded: false,
    paths: {},
    searchResultIds: [],
    activeGroupField: undefined,
    activeGroups: [],
    activeGroupedBookIds: [],
    activeSearch: { query: undefined, results: [] },
};
