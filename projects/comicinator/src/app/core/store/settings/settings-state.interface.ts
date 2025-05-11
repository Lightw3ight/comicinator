import { AppSettings } from "../../models/app-settings.interface";

export interface SettingsState {
    settings: AppSettings,
    loaded: boolean
}

export const SETTINGS_INITIAL_STATE: SettingsState = {
    settings: {
        libraryPath: '',
        apiKey: undefined
    },
    loaded: false
}