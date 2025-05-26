import { signalStore, withState } from '@ngrx/signals';
import { withTeamsCoreFeature } from './teams-core.feature';
import { TEAMS_INITIAL_STATE } from './teams-state.interface';
import { withTeamsSearchFeature } from './teams-search.feature';

export const TeamsStore = signalStore(
    { providedIn: 'root' },
    withState(TEAMS_INITIAL_STATE),
    withTeamsCoreFeature(),
    withTeamsSearchFeature(),
);
