import { signalStore, withState } from '@ngrx/signals';
import { withPublishersCoreFeature } from './publishers-core.feature';
import { PUBLISHERS_INITIAL_STATE } from './publishers-state.interface';

export const PublishersStore = signalStore(
    { providedIn: 'root' },
    withState(PUBLISHERS_INITIAL_STATE),
    withPublishersCoreFeature()
);
