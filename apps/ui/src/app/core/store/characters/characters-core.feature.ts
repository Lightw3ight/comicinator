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
import { CharacterResult } from '../../api/comic-vine/models/character-result.interface';
import { TeamsApiService } from '../../api/teams/teams-api.service';
import { Character } from '../../models/character.interface';
import { PAGE_SCROLL_SIZE } from '../../models/page-scroll-size.const';
import { SortDirection } from '../../models/sort-direction.type';
import { chunkItems } from '../chunk-items';
import { SortState } from '../models/sort-state.interface';
import { CharactersState } from './characters-state.interface';

const CHARACTER_STATE_KEY = 'cbx-character-state';

export function withCharactersCoreFeature() {
    return signalStoreFeature(
        { state: type<CharactersState>() },

        withEntities<Character>(),

        withMethods((store) => {
            const charactersApiService = inject(CharactersApiService);
            const teamsApiService = inject(TeamsApiService);

            return {
                persistState() {
                    const state: SortState<Character> = {
                        sortField: store.sortField(),
                        sortDirection: store.sortDirection(),
                    };

                    store2(CHARACTER_STATE_KEY, state);
                },

                setColumnCount(count: number) {
                    if (count !== store.columnCount()) {
                        patchState(store, { columnCount: count });
                    }
                },

                setSorting(field: keyof Character, dir: SortDirection) {
                    patchState(store, {
                        sortField: field,
                        sortDirection: dir,
                    });
                    this.persistState();
                },

                async resetPageData() {
                    const columnCount = store.columnCount();
                    const itemCount =
                        await charactersApiService.selectManyCount(
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
                    const books = await charactersApiService.selectMany(
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

                async loadCharacter(id: number) {
                    if (store.entityMap()[id] != null) {
                        return;
                    }

                    const char = await charactersApiService.selectById(id);
                    patchState(store, addEntity(char));
                },

                async selectImage(
                    characterId: number
                ): Promise<Blob | undefined> {
                    return await charactersApiService.selectImage(characterId);
                },

                async loadByIds(ids: number[]) {
                    const toLoad = ids.filter(
                        (id) => store.entityMap()[id] == null
                    );
                    if (toLoad.length > 0) {
                        const items = await charactersApiService.selectByIds(
                            toLoad
                        );
                        patchState(store, addEntities(items));
                    }
                },

                async removeCharacter(characterId: number) {
                    await charactersApiService.remove(characterId);
                    patchState(store, removeEntity(characterId));
                },

                async importCharacter(
                    data: CharacterResult,
                    publisherId: number | undefined,
                    currentTeamId?: number
                ): Promise<number> {
                    let image: Blob | undefined;

                    if (
                        !data.image.original_url
                            .toLocaleLowerCase()
                            .endsWith('blank.png')
                    ) {
                        try {
                            const response = await fetch(
                                data.image.original_url
                            );
                            image = await response.blob();
                        } catch {
                            image = undefined;
                        }
                    }

                    let teamIds: number[] = [];

                    if (data.teams) {
                        const externalIds = data.teams.map((o) => o.id);
                        teamIds = await teamsApiService.selectByExternalIds(
                            externalIds
                        );

                        if (currentTeamId) {
                            teamIds = teamIds.filter(
                                (id) => id !== currentTeamId
                            );
                        }
                    }

                    const newChar: Omit<Character, 'id'> = {
                        name: data.name,
                        dateAdded: new Date(),
                        aliases: data.aliases,
                        birthDate: data.birth,
                        creators: data.creators,
                        description: data.summary,
                        externalId: data.id,
                        externalUrl: data.siteUrl,
                        gender: data.gender,
                        origin: data.origin,
                        powers: data.powers,
                        publisherId: publisherId,
                        realName: data.realName,
                    };

                    return await this.addCharacter(
                        newChar,
                        image,
                        teamIds,
                        false
                    );
                },

                async updateCharacter(
                    id: number,
                    char: Partial<Character>,
                    image: Blob | undefined,
                    teamIds: number[]
                ) {
                    const updatedChar = await charactersApiService.update(
                        id,
                        char,
                        image,
                        teamIds
                    );
                    patchState(
                        store,
                        updateEntity({ id: id, changes: updatedChar })
                    );
                },

                async addCharacter(
                    character: Omit<Character, 'id'>,
                    image?: Blob,
                    teamIds?: number[],
                    checkForExisting = true
                ): Promise<number> {
                    if (checkForExisting) {
                        const existing =
                            await charactersApiService.findForImport(
                                null,
                                character.name,
                                character.publisherId
                            );

                        if (existing) {
                            return existing.id;
                        }
                    }

                    const added = await await charactersApiService.insert(
                        character,
                        image,
                        teamIds
                    );

                    patchState(store, addEntity(added));

                    return added.id;
                },

                async addCharactersByName(
                    characters: string | undefined,
                    publisherId: number | undefined
                ) {
                    if (characters == null || characters.trim().length === 0) {
                        return [];
                    }

                    const names = characters.split(',').map((c) => c.trim());
                    const characterIds: number[] = [];

                    for (const name of names) {
                        const id = await this.addCharacter({
                            name,
                            publisherId,
                            dateAdded: new Date(),
                        });
                        characterIds.push(id);
                    }

                    return characterIds;
                },
            };
        }),

        withHooks((store) => {
            return {
                async onInit() {
                    const state = store2(
                        CHARACTER_STATE_KEY
                    ) as SortState<Character>;

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
