import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withComputed,
    withMethods,
} from '@ngrx/signals';
import {
    addEntities,
    addEntity,
    setAllEntities,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { TeamResult } from '../../api/comic-vine/models/team-result.interface';
import { TeamsApiService } from '../../api/teams/teams-api.service';
import { LoadState } from '../../models/load-state.enum';
import { Publisher } from '../../models/publisher.interface';
import { Team } from '../../models/team.interface';
import { CharactersStore } from '../characters/characters.store';
import { PublishersStore } from '../publishers/publishers.store';
import { TeamsState } from './teams-state.interface';

export function withTeamsCoreFeature<_>() {
    return signalStoreFeature(
        { state: type<TeamsState>() },

        withEntities<Team>(),

        withComputed((store) => {
            return {
                displayItems: computed(() => {
                    const search = store.search();
                    const em = store.entityMap();
                    let bookIds =
                        store.quickSearchResultCache()[store.quickSearch()] ??
                        [];

                    if (search?.length) {
                        bookIds = store.activeDisplayIds();
                    }

                    return bookIds.map((id) => em[id]);
                }),
            };
        }),

        withMethods((store) => {
            const teamsApiService = inject(TeamsApiService);
            const publishersStore = inject(PublishersStore);
            const charactersStore = inject(CharactersStore);

            return {
                async runQuickSearch(filter: string) {
                    patchState(store, { quickSearch: filter });

                    if (store.quickSearchResultCache()[filter] != null) {
                        return;
                    }

                    const teams = await teamsApiService.startsWith(filter);

                    patchState(store, addEntities(teams), {
                        quickSearch: filter,
                        quickSearchResultCache: {
                            ...store.quickSearchResultCache(),
                            [filter]: teams.map((o) => o.id),
                        },
                    });
                },

                async loadTeams() {
                    if (store.loadState() !== LoadState.Initial) {
                        return;
                    }

                    patchState(store, { loadState: LoadState.Loading });

                    const teams = await teamsApiService.selectAll();
                    const names = teams.reduce(
                        (acc, c) => ({
                            ...acc,
                            [c.name.trim().toLocaleLowerCase()]: c.id,
                        }),
                        {},
                    );

                    patchState(store, setAllEntities(teams), {
                        loadState: LoadState.Loaded,
                    });
                },

                async loadTeam(id: number) {
                    if (store.entityMap()[id] != null) {
                        return;
                    }

                    const char = await teamsApiService.selectById(id);
                    patchState(store, addEntity(char));
                },

                async loadByIds(ids: number[]) {
                    const toLoad = ids.filter(
                        (id) => store.entityMap()[id] == null,
                    );
                    if (toLoad.length > 0) {
                        const items = await teamsApiService.selectByIds(toLoad);
                        patchState(store, addEntities(items));
                    }
                },

                async searchByCharacter(characterId: number): Promise<Team[]> {
                    const teams =
                        await teamsApiService.selectByCharacter(characterId);
                    patchState(store, addEntities(teams));
                    return teams;
                },

                async selectByBook(bookId: number): Promise<Team[]> {
                    const teams = await teamsApiService.selectByBook(bookId);
                    patchState(store, addEntities(teams));
                    return teams;
                },

                async selectImage(teamId: number): Promise<Blob | undefined> {
                    return await teamsApiService.selectImage(teamId);
                },

                async importTeam(data: TeamResult): Promise<number> {
                    let image: Blob | undefined;
                    try {
                        const response = await fetch(data.image.originalUrl);
                        image = await response.blob();
                    } catch {}

                    let publisherId: number | undefined;

                    if (data.publisher != null) {
                        let existing: Publisher | undefined =
                            publishersStore.entityMap()[data.publisher.id];
                        if (!existing) {
                            existing = publishersStore
                                .entities()
                                .find(
                                    (p) =>
                                        p.name.toLocaleLowerCase() ===
                                        data.publisher?.name.toLocaleLowerCase(),
                                );
                        }

                        if (existing) {
                            publisherId = existing.id;
                        } else {
                            publisherId = await publishersStore.addPublisher({
                                name: data.publisher!.name,
                                externalId: data.publisher!.id,
                                externalUrl: data.publisher!.siteUrl,
                            });
                        }
                    }

                    let characterIds: number[] = [];

                    if (data.characters) {
                        characterIds = data.characters
                            .map(
                                (char) =>
                                    charactersStore
                                        .entities()
                                        .find((o) => o.externalId === char.id)
                                        ?.id,
                            )
                            .filter((val) => val != null);
                    }

                    const newTeam: Omit<Team, 'id'> = {
                        name: data.name,
                        dateAdded: new Date(),
                        aliases: data.aliases,
                        description: data.description,
                        externalId: data.id,
                        externalUrl: data.siteUrl,
                        publisherId: publisherId,
                        summary: data.summary,
                    };

                    return await this.addTeam(newTeam, image, characterIds);
                },

                async addTeam(
                    team: Omit<Team, 'id' | 'dateAdded'>,
                    image: Blob | undefined,
                    characterIds: number[],
                ): Promise<number> {
                    const existing = await teamsApiService.findForImport(
                        null,
                        team.name,
                    );

                    if (existing) {
                        return existing.id;
                    }

                    const added = await teamsApiService.create(
                        team,
                        image,
                        characterIds,
                    );

                    patchState(store, addEntity(added));

                    return added.id;
                },

                async updateTeam(
                    id: number,
                    team: Partial<Team>,
                    image: Blob | undefined,
                    characterIds: number[],
                ) {
                    const updatedTeam = await teamsApiService.updateTeam(
                        id,
                        team,
                        image,
                        characterIds,
                    );

                    patchState(
                        store,
                        updateEntity({ id: id, changes: updatedTeam }),
                    );
                },

                async addTeamsByName(commaDelimitedTeams: string | undefined) {
                    if (
                        commaDelimitedTeams == null ||
                        commaDelimitedTeams.trim().length === 0
                    ) {
                        return [];
                    }

                    const names = commaDelimitedTeams
                        .split(',')
                        .map((t) => t.trim());
                    const teamIds: number[] = [];

                    for (let name of names) {
                        const team: Omit<Team, 'id' | 'dateAdded'> = {
                            name: name!,
                        };
                        const id = await this.addTeam(team, undefined, []);
                        teamIds.push(id);
                    }

                    return teamIds;
                },
            };
        }),
    );
}
