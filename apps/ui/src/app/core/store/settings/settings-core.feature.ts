import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import { SettingsApiService } from '../../api/settings/settings-api.service';
import { AppSettings } from '../../models/app-settings.interface';
import { SettingsState } from './settings-state.interface';

export function withSettingsCoreFeature() {
    return signalStoreFeature(
        { state: type<SettingsState>() },

        withMethods((store) => {
            const settingsApiService = inject(SettingsApiService);

            return {
                async loadSettings() {
                    const settings = await settingsApiService.selectAll();
                    patchState(store, { settings, loaded: true });
                },

                async saveSettings(settings: Partial<AppSettings>) {
                    await settingsApiService.saveSettings(settings);
                    patchState(store, {
                        settings: {
                            ...store.settings(),
                            ...settings,
                        },
                    });
                },
            };
        }),
        withHooks({
            async onInit(store) {
                await store.loadSettings();
            },
        }),
    );
}
