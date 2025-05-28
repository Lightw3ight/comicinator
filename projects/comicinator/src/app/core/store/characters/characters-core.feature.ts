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
    removeEntity,
    setAllEntities,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { CharactersApiService } from '../../api/characters/characters-api.service';
import { CharacterResult } from '../../api/comic-vine/models/character-result.interface';
import { Character } from '../../models/character.interface';
import { LoadState } from '../../models/load-state.enum';
import { Publisher } from '../../models/publisher.interface';
import { PublishersStore } from '../publishers/publishers.store';
import { CharactersState } from './characters-state.interface';

export function withCharactersCoreFeature() {
    return signalStoreFeature(
        { state: type<CharactersState>() },

        withEntities<Character>(),

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
            const charactersApiService = inject(CharactersApiService);
            const publishersStore = inject(PublishersStore);

            return {
                async runQuickSearch(filter: string) {
                    patchState(store, { quickSearch: filter });

                    if (store.quickSearchResultCache()[filter] != null) {
                        return;
                    }

                    const items = await charactersApiService.startsWith(filter);

                    patchState(store, addEntities(items), {
                        quickSearch: filter,
                        quickSearchResultCache: {
                            ...store.quickSearchResultCache(),
                            [filter]: items.map((o) => o.id),
                        },
                    });
                },

                async loadCharacter(id: number) {
                    if (store.entityMap()[id] != null) {
                        return;
                    }

                    const char = await charactersApiService.selectById(id);
                    patchState(store, addEntity(char));
                },

                async selectImage(
                    characterId: number,
                ): Promise<Blob | undefined> {
                    return await charactersApiService.selectImage(characterId);
                },

                async selectByBook(bookId: number) {
                    const books =
                        await charactersApiService.selectByBook(bookId);
                    patchState(store, addEntities(books));
                    return books;
                },

                async loadByIds(ids: number[]) {
                    const toLoad = ids.filter(
                        (id) => store.entityMap()[id] == null,
                    );
                    if (toLoad.length > 0) {
                        const items =
                            await charactersApiService.selectByIds(toLoad);
                        patchState(store, addEntities(items));
                    }
                },

                async loadCharacters() {
                    if (store.loadState() !== LoadState.Initial) {
                        return;
                    }

                    patchState(store, { loadState: LoadState.Loading });

                    const characters = await charactersApiService.selectAll();

                    patchState(store, setAllEntities(characters), {
                        loadState: LoadState.Loaded,
                    });
                },

                async removeCharacter(characterId: number) {
                    await charactersApiService.remove(characterId);
                    patchState(store, removeEntity(characterId));
                },

                async importCharacter(
                    data: CharacterResult,
                    teamIds?: number[],
                ): Promise<number> {
                    let image: Blob | undefined;
                    try {
                        const response = await fetch(data.image.original_url);
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

                    const newChar: Omit<Character, 'id'> = {
                        name: data.name,
                        dateAdded: new Date(),
                        aliases: data.aliases,
                        birthDate: data.birth,
                        creators: data.creators,
                        description: data.description,
                        externalId: data.id,
                        externalUrl: data.siteUrl,
                        gender: data.gender,
                        origin: data.origin,
                        powers: data.powers,
                        publisherId: publisherId,
                        realName: data.realName,
                        summary: data.summary,
                    };

                    return await this.addCharacter(newChar, image, teamIds);
                },

                async updateCharacter(
                    id: number,
                    char: Partial<Character>,
                    image: Blob | undefined,
                    teamIds: number[],
                ) {
                    const updatedChar = await charactersApiService.update(
                        id,
                        char,
                        image,
                        teamIds,
                    );
                    patchState(
                        store,
                        updateEntity({ id: id, changes: updatedChar }),
                    );
                },

                async addCharacter(
                    character: Omit<Character, 'id'>,
                    image?: Blob,
                    teamIds?: number[],
                ): Promise<number> {
                    const existing = await charactersApiService.findForImport(
                        null,
                        character.name,
                    );

                    if (existing) {
                        return existing.id;
                    }

                    const added = await await charactersApiService.insert(
                        character,
                        image,
                        teamIds,
                    );

                    patchState(store, addEntity(added));

                    return added.id;
                },

                async addCharactersByName(characters: string | undefined) {
                    if (characters == null || characters.trim().length === 0) {
                        return [];
                    }

                    const names = characters.split(',').map((c) => c.trim());
                    const characterIds: number[] = [];

                    for (let name of names) {
                        const id = await this.addCharacter({
                            name,
                            dateAdded: new Date(),
                        });
                        characterIds.push(id);
                    }

                    return characterIds;
                },
            };
        }),
    );
}
