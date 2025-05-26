import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withComputed,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import {
    addEntity,
    EntityState,
    setAllEntities,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { TeamResult } from '../../api/comic-vine/models/team-result.interface';
import { TeamsApiService } from '../../api/teams/teams-api.service';
import { Team } from '../../models/team.interface';
import { TeamsState } from './teams-state.interface';
import { PublishersStore } from '../publishers/publishers.store';
import { Publisher } from '../../models/publisher.interface';
import { CharactersStore } from '../characters/characters.store';
import { BooksApiService } from '../../api/books/books-api.service';
import { CharactersApiService } from '../../api/characters/characters-api.service';

export function withTeamsCoreFeature<_>() {
    return signalStoreFeature(
        { state: type<TeamsState>() },

        withEntities<Team>(),

        withComputed((store) => {
            return {
                pageView: computed(() => {
                    const search = store.activeSearch.query();

                    if (search == null || search === '') {
                        return store.entities();
                    }

                    const em = store.entityMap();
                    return store.activeSearch.results().map((id) => em[id]);
                }),
            };
        }),

        withMethods((store) => {
            const teamsApiService = inject(TeamsApiService);
            const booksApiService = inject(BooksApiService);
            const charactersApiService = inject(CharactersApiService);
            const publishersStore = inject(PublishersStore);
            const charactersStore = inject(CharactersStore);

            return {
                async loadTeams() {
                    const teams = await teamsApiService.fetchTeams();
                    const names = teams.reduce(
                        (acc, c) => ({
                            ...acc,
                            [c.name.trim().toLocaleLowerCase()]: c.id,
                        }),
                        {},
                    );

                    patchState(store, setAllEntities(teams), {
                        loaded: true,
                        names,
                    });
                },

                async setActiveTeam(teamId: number) {
                    const characterIds =
                        await charactersApiService.selectByTeam(teamId);
                    const bookIds = await booksApiService.searchByTeam(teamId);

                    patchState(store, {
                        activeTeam: {
                            teamId,
                            characterIds,
                            bookIds,
                        },
                    });
                },

                clearActiveTeam() {
                    patchState(store, {
                        activeTeam: {
                            teamId: undefined,
                            characterIds: [],
                            bookIds: [],
                        },
                    });
                },

                async selectIdsByBook(bookId: number): Promise<number[]> {
                    return await teamsApiService.selectByBook(bookId);
                },

                async selectIdsByCharacter(
                    characterId: number,
                ): Promise<number[]> {
                    return await teamsApiService.selectByCharacter(characterId);
                },

                async selectByBook(bookId: number): Promise<Team[]> {
                    const ids = await teamsApiService.selectByBook(bookId);
                    return ids.map((id) => store.entityMap()[id]);
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

                    const newChar: Omit<Team, 'id'> = {
                        name: data.name,
                        dateAdded: new Date(),
                        aliases: data.aliases,
                        description: data.description,
                        externalId: data.id,
                        externalUrl: data.siteUrl,
                        publisherId: publisherId,
                        summary: data.summary,
                        image: image,
                    };

                    return await this.addTeam(newChar, characterIds);
                },

                async addTeam(
                    team: Omit<Team, 'id'>,
                    characterIds: number[],
                ): Promise<number> {
                    const existingId =
                        store.names()[team.name.trim().toLocaleLowerCase()];

                    if (existingId) {
                        return existingId;
                    }

                    const added = await teamsApiService.insertTeam(
                        team,
                        characterIds,
                    );

                    patchState(store, addEntity(added), {
                        names: {
                            ...store.names(),
                            [added.name.trim().toLocaleLowerCase()]: added.id,
                        },
                    });

                    return added.id;
                },

                async updateTeam(
                    id: number,
                    team: Partial<Team>,
                    characterIds: number[],
                ) {
                    await teamsApiService.updateTeam(id, team, characterIds);

                    patchState(store, updateEntity({ id: id, changes: team }));
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
                        const id = await this.addTeam(
                            {
                                name,
                                dateAdded: new Date(),
                            },
                            [],
                        );
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
        }),
    );
}
