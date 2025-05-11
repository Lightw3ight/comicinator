import { Dictionary } from "../../models/dictionary.interface";

export interface TeamsState {
    loaded: boolean;
    names: Dictionary<number>;
}

export const TEAMS_INITIAL_STATE: TeamsState = {
    loaded: false,
    names: {}
}