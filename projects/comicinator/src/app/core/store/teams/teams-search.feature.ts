import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withComputed,
    withMethods,
} from '@ngrx/signals';
import { EntityProps, EntityState } from '@ngrx/signals/entities';
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
                    const ids = await teamsApiService.search(query);

                    patchState(store, {
                        activeSearch: {
                            query,
                            results: ids,
                        },
                    });
                },

                clearSearch() {
                    patchState(store, {
                        activeSearch: {
                            query: undefined,
                            results: [],
                        },
                    });
                },
            };
        }),
    );
}
