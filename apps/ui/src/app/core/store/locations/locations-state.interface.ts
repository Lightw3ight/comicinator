import { Location } from '../../models/location.interface';
import { EntityBaseState } from '../entity-base-state.interface';

export interface LocationsState extends EntityBaseState<Location, number> {}

export const LOCATIONS_INITIAL_STATE: LocationsState = {
    sortField: 'name',
    sortDirection: 'ASC',
    searchText: undefined,
    pagesLoaded: {},
    pagedData: [],
    itemCount: 0,
    columnCount: 0,
};
