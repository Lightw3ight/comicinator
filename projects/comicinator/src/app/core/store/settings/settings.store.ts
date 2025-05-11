import { signalStore, withState } from '@ngrx/signals';
import { withSettingsCoreFeature } from './settings-core.feature';
import { SETTINGS_INITIAL_STATE } from './settings-state.interface';

export const SettingsStore = signalStore(
    { providedIn: 'root' },
    withState(SETTINGS_INITIAL_STATE),
    withSettingsCoreFeature()
);
