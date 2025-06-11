import { Team } from '../../models/team.interface';
import { EntityBaseState } from '../entity-base-state.interface';

export interface TeamsState extends EntityBaseState<Team, number> {}

export const TEAMS_INITIAL_STATE: TeamsState = {
    sortField: 'name',
    sortDirection: 'ASC',
    searchText: undefined,
    pagesLoaded: {},
    pagedData: [],
    itemCount: 0,
    columnCount: 0,
};
