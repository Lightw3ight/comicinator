import { AppSettings } from '../../models/app-settings.interface';

export interface SettingsState {
    settings: AppSettings;
    loaded: boolean;
}

export const SETTINGS_INITIAL_STATE: SettingsState = {
    settings: {
        libraryPath: '',
        apiKey: undefined,
        filePattern: '{series}{ <number3>}{(<year>)}',
        folderPattern: '{<publisher>}{<series>}{<volume0>}',
    },
    loaded: false,
};
