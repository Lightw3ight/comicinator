import { signalStore, withState } from '@ngrx/signals';
import { withLocationsCoreFeature } from './locations-core.feature';
import { LOCATIONS_INITIAL_STATE } from './locations-state.interface';
import { withLocationsSearchFeature } from './locations-search.feature';

export const LocationsStore = signalStore(
    { providedIn: 'root' },
    withState(LOCATIONS_INITIAL_STATE),
    withLocationsCoreFeature(),
    withLocationsSearchFeature(),
);
