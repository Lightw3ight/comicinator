import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import {
    addEntities,
    addEntity,
    removeEntity,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { TeamResult } from '../../api/comic-vine/models/team-result.interface';
import { TeamsApiService } from '../../api/teams/teams-api.service';
import { PAGE_SCROLL_SIZE } from '../../models/page-scroll-size.const';
import { Publisher } from '../../models/publisher.interface';
import { SortDirection } from '../../models/sort-direction.type';
import { Team } from '../../models/team.interface';
import { CharactersStore } from '../characters/characters.store';
import { chunkItems } from '../chunk-items';
import { PublishersStore } from '../publishers/publishers.store';
import { TeamsState } from './teams-state.interface';
import { SortState } from '../models/sort-state.interface';
import store2 from 'store2';

const TEAM_STATE_KEY = 'cbx-team-state';

export function withTeamsCoreFeature<_>() {
    return signalStoreFeature(
        { state: type<TeamsState>() },

        withEntities<Team>(),

        withMethods((store) => {
            const teamsApiService = inject(TeamsApiService);
            const publishersStore = inject(PublishersStore);
            const charactersStore = inject(CharactersStore);

            return {
                persistState() {
                    const state: SortState<Team> = {
                        sortField: store.sortField(),
                        sortDirection: store.sortDirection(),
                    };

                    store2(TEAM_STATE_KEY, state);
                },

                setColumnCount(count: number) {
                    if (count !== store.columnCount()) {
                        patchState(store, { columnCount: count });
                    }
                },

                setSorting(field: keyof Team, dir: SortDirection) {
                    patchState(store, {
                        sortField: field,
                        sortDirection: dir,
                    });
                    this.persistState();
                },

                async resetPageData() {
                    const columnCount = store.columnCount();
                    const itemCount = await teamsApiService.selectManyCount(
                        store.searchText(),
                    );

                    if (itemCount === 0 || columnCount === 0) {
                        patchState(store, {
                            pagedData: [],
                            pagesLoaded: {},
                            itemCount,
                            columnCount,
                        });
                    } else {
                        const rowCount = Math.ceil(itemCount / columnCount);
                        const pagedData = Array.from<number[]>({
                            length: rowCount,
                        });
                        patchState(store, {
                            pagedData,
                            pagesLoaded: {},
                            itemCount,
                            columnCount,
                        });
                    }
                },

                setSearch(query: string) {
                    if (query !== store.searchText()) {
                        patchState(store, {
                            searchText: query,
                        });
                    }
                },

                clearSearch() {
                    if (store.searchText() != null) {
                        patchState(store, {
                            searchText: undefined,
                        });
                    }
                },

                async loadPage(pageIndex: number) {
                    if (store.pagesLoaded()[pageIndex]) {
                        return;
                    }

                    patchState(store, {
                        pagesLoaded: {
                            ...store.pagesLoaded(),
                            [pageIndex]: true,
                        },
                    });

                    const offset = pageIndex * PAGE_SCROLL_SIZE;
                    const books = await teamsApiService.selectMany(
                        store.searchText(),
                        offset,
                        PAGE_SCROLL_SIZE * store.columnCount(),
                        store.sortField(),
                        store.sortDirection(),
                    );
                    const ids = books.map((o) => o.id);
                    const chunkedIds = chunkItems(ids, store.columnCount());
                    const pagedData = [...store.pagedData()];
                    pagedData.splice(
                        pageIndex * PAGE_SCROLL_SIZE,
                        PAGE_SCROLL_SIZE,
                        ...chunkedIds,
                    );
                    patchState(store, addEntities(books), { pagedData });
                },

                async loadTeam(id: number) {
                    if (store.entityMap()[id] != null) {
                        return;
                    }

                    const item = await teamsApiService.selectById(id);
                    patchState(store, addEntity(item));
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

                    return await this.addTeam(
                        newTeam,
                        image,
                        characterIds,
                        false,
                    );
                },

                async addTeam(
                    team: Omit<Team, 'id' | 'dateAdded'>,
                    image: Blob | undefined,
                    characterIds: number[],
                    checkForExisting = true,
                ): Promise<number> {
                    if (checkForExisting) {
                        const existing = await teamsApiService.findForImport(
                            null,
                            team.name,
                            undefined,
                        );

                        if (existing) {
                            return existing.id;
                        }
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

                async removeTeam(teamId: number) {
                    await teamsApiService.remove(teamId);
                    patchState(store, removeEntity(teamId));
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

        withHooks((store) => {
            return {
                async onInit() {
                    const state = store2(TEAM_STATE_KEY) as SortState<Team>;

                    if (state) {
                        patchState(store, {
                            sortField: state.sortField ?? store.sortField(),
                            sortDirection:
                                state.sortDirection ?? store.sortDirection(),
                        });
                    }
                },
            };
        }),
    );
}
