import { signalStore, withState } from '@ngrx/signals';
import { withCharactersCoreFeature } from './characters-core.feature';
import { CHARACTERS_INITIAL_STATE } from './characters-state.interface';
import { withCharactersSearchFeature } from './characters-search.feature';

export const CharactersStore = signalStore(
    { providedIn: 'root' },
    withState(CHARACTERS_INITIAL_STATE),
    withCharactersCoreFeature(),
    withCharactersSearchFeature()
);
