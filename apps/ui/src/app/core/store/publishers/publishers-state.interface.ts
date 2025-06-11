import { Dictionary } from '../../models/dictionary.interface';

export interface PublishersState {
    loaded: boolean;
}

export const PUBLISHERS_INITIAL_STATE: PublishersState = {
    loaded: false,
};
