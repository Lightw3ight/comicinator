import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { addEntities, EntityState } from '@ngrx/signals/entities';
import { TeamsApiService } from '../../api/teams/teams-api.service';
import { Team } from '../../models/team.interface';
import { TeamsState } from './teams-state.interface';

export function withTeamsSearchFeature<_>() {
    return signalStoreFeature(
        { state: type<TeamsState & EntityState<Team>>() },

        withMethods((store) => {
            const teamsApiService = inject(TeamsApiService);

            return {
                async quickFind(query: string) {
                    const items = await teamsApiService.selectMany(query);
                    patchState(store, addEntities(items));
                    return items;
                },
            };
        }),
    );
}
