import { Dictionary } from '../../models/dictionary.interface';
import { LibraryFilter } from '../../models/library-filter.interface';

export interface LibraryState {
    filters: Dictionary<LibraryFilter[]>;
}

export const INITIAL_LIBRARY_STATE: LibraryState = {
    filters: {},
};
