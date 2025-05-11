import { Book } from "../../models/book.interface";
import { Dictionary } from "../../models/dictionary.interface";

export interface BooksState {
    loaded: boolean;
    paths: Dictionary<boolean>;
}

export const BOOKS_INITIAL_STATE: BooksState = {
    loaded: false,
    paths: {}
}