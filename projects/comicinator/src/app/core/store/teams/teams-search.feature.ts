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
                async search(query: string) {
                    const teams = await teamsApiService.search(query);
                    patchState(store, addEntities(teams));
                    return teams;
                },

                async setActiveSearch(query: string) {
                    const teams = await this.search(query);

                    patchState(store, addEntities(teams), {
                        search: query,
                        activeDisplayIds: teams.map((o) => o.id),
                    });
                },

                clearSearch() {
                    patchState(store, {
                        search: undefined,
                        activeDisplayIds: [],
                    });
                },
            };
        }),
    );
}
