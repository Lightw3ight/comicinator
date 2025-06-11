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
import store2 from 'store2';
import { CharactersApiService } from '../../api/characters/characters-api.service';
import { TeamResult } from '../../api/comic-vine/models/team-result.interface';
import { TeamsApiService } from '../../api/teams/teams-api.service';
import { PAGE_SCROLL_SIZE } from '../../models/page-scroll-size.const';
import { SortDirection } from '../../models/sort-direction.type';
import { Team } from '../../models/team.interface';
import { chunkItems } from '../chunk-items';
import { SortState } from '../models/sort-state.interface';
import { TeamsState } from './teams-state.interface';

const TEAM_STATE_KEY = 'cbx-team-state';

export function withTeamsCoreFeature<_>() {
    return signalStoreFeature(
        { state: type<TeamsState>() },

        withEntities<Team>(),

        withMethods((store) => {
            const teamsApiService = inject(TeamsApiService);
            const charactersApiService = inject(CharactersApiService);

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
                        store.searchText()
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
                        store.sortDirection()
                    );
                    const ids = books.map((o) => o.id);
                    const chunkedIds = chunkItems(ids, store.columnCount());
                    const pagedData = [...store.pagedData()];
                    pagedData.splice(
                        pageIndex * PAGE_SCROLL_SIZE,
                        PAGE_SCROLL_SIZE,
                        ...chunkedIds
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
                        (id) => store.entityMap()[id] == null
                    );
                    if (toLoad.length > 0) {
                        const items = await teamsApiService.selectByIds(toLoad);
                        patchState(store, addEntities(items));
                    }
                },

                async searchByCharacter(characterId: number): Promise<Team[]> {
                    const teams = await teamsApiService.selectByCharacter(
                        characterId
                    );
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

                async importTeam(
                    data: TeamResult,
                    publisherId: number | undefined
                ): Promise<number> {
                    let image: Blob | undefined;
                    if (
                        !data.image.originalUrl
                            .toLocaleLowerCase()
                            .endsWith('blank.png')
                    ) {
                        try {
                            const response = await fetch(
                                data.image.originalUrl
                            );
                            image = await response.blob();
                        } catch {
                            image = undefined;
                        }
                    }

                    let characterIds: number[] = [];

                    if (data.characters) {
                        const externalIds = data.characters.map((o) => o.id);
                        characterIds =
                            await charactersApiService.selectByExternalIds(
                                externalIds
                            );
                    }

                    const newTeam: Omit<Team, 'id'> = {
                        name: data.name,
                        dateAdded: new Date(),
                        aliases: data.aliases,
                        description: data.summary,
                        externalId: data.id,
                        externalUrl: data.siteUrl,
                        publisherId: publisherId,
                    };

                    return await this.addTeam(
                        newTeam,
                        image,
                        characterIds,
                        false
                    );
                },

                async addTeam(
                    team: Omit<Team, 'id' | 'dateAdded'>,
                    image: Blob | undefined,
                    characterIds: number[],
                    checkForExisting = true
                ): Promise<number> {
                    if (checkForExisting) {
                        const existing = await teamsApiService.findForImport(
                            null,
                            team.name,
                            team.publisherId
                        );

                        if (existing) {
                            return existing.id;
                        }
                    }

                    const added = await teamsApiService.create(
                        team,
                        image,
                        characterIds
                    );

                    patchState(store, addEntity(added));

                    return added.id;
                },

                async updateTeam(
                    id: number,
                    team: Partial<Team>,
                    image: Blob | undefined,
                    characterIds: number[]
                ) {
                    const updatedTeam = await teamsApiService.updateTeam(
                        id,
                        team,
                        image,
                        characterIds
                    );

                    patchState(
                        store,
                        updateEntity({ id: id, changes: updatedTeam })
                    );
                },

                async removeTeam(teamId: number) {
                    await teamsApiService.remove(teamId);
                    patchState(store, removeEntity(teamId));
                },

                async addTeamsByName(
                    commaDelimitedTeams: string | undefined,
                    publisherId: number | undefined
                ) {
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

                    for (const name of names) {
                        const team: Omit<Team, 'id' | 'dateAdded'> = {
                            name: name!,
                            publisherId,
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
        })
    );
}
