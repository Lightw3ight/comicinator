import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import {
    addEntity,
    setAllEntities,
    withEntities,
} from '@ngrx/signals/entities';
import { TeamsApiService } from '../../api/teams/teams-api.service';
import { Team } from '../../models/team.interface';
import { TeamsState } from './teams-state.interface';

export function withTeamsCoreFeature() {
    return signalStoreFeature(
        { state: type<TeamsState>() },

        withEntities<Team>(),

        withMethods((store) => {
            const teamsApiService = inject(TeamsApiService);

            return {
                async loadTeams() {
                    const teams =
                        await teamsApiService.fetchTeams();
                    const names = teams.reduce(
                        (acc, c) => ({
                            ...acc,
                            [c.name.trim().toLocaleLowerCase()]: c.id,
                        }),
                        {}
                    );

                    patchState(store, setAllEntities(teams), {
                        loaded: true,
                        names,
                    });
                },

                async addTeam(
                    team: Omit<Team, 'id'>
                ): Promise<number> {
                    const existingId =
                        store.names()[
                            team.name.trim().toLocaleLowerCase()
                        ];

                    if (existingId) {
                        return existingId;
                    }

                    const added =
                        await await teamsApiService.insertTeam(
                            team
                        );

                    patchState(store, addEntity(added), {
                        names: {
                            ...store.names(),
                            [added.name.trim().toLocaleLowerCase()]: added.id
                        }
                    });

                    return added.id;
                },

                async addTeamsByName(commaDelimitedTeams: string | undefined) {
                    if (commaDelimitedTeams == null || commaDelimitedTeams.trim().length === 0) {
                        return [];
                    }

                    const names = commaDelimitedTeams.split(',').map((t) => t.trim());
                    const teamIds: number[] = [];

                    for (let name of names) {
                        const id = await this.addTeam({ name, dateAdded: new Date() });
                        teamIds.push(id);
                    }

                    return teamIds;
                },
            };
        }),

        withHooks({
            async onInit(store) {
                await store.loadTeams();
            },
        })
    );
}
