import { Dictionary } from '../../models/dictionary.interface';

export interface LocationsState {
    loaded: boolean;
    names: Dictionary<number>;
    activeLocation: { bookIds: number[]; locationId: number | undefined };
    activeSearch: { query: string | undefined; results: number[] };
}

export const LOCATIONS_INITIAL_STATE: LocationsState = {
    loaded: false,
    names: {},
    activeLocation: { bookIds: [], locationId: undefined },
    activeSearch: { query: undefined, results: [] },
};
