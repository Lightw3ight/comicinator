import { signalStore, withState } from '@ngrx/signals';
import { withCharactersCoreFeature } from './characters-core.feature';
import { CHARACTERS_INITIAL_STATE } from './characters-state.interface';

export const CharactersStore = signalStore(
    { providedIn: 'root' },
    withState(CHARACTERS_INITIAL_STATE),
    withCharactersCoreFeature()
);
