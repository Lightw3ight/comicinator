import { Book } from '../../../core/models/book.interface';
import { Location } from '../../../core/models/location.interface';

export interface LocationDetailsState {
    location: Location | undefined;
    books: Book[];
}

export const LOCATION_DETAILS_INITIAL_STATE: LocationDetailsState = {
    location: undefined,
    books: [],
};
