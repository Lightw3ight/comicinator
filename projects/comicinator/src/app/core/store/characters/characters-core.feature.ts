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
    removeEntity,
    setAllEntities,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { BooksApiService } from '../../api/books/books-api.service';
import { CharactersApiService } from '../../api/characters/characters-api.service';
import { CharacterResult } from '../../api/comic-vine/models/character-result.interface';
import { TeamsApiService } from '../../api/teams/teams-api.service';
import { Character } from '../../models/character.interface';
import { Publisher } from '../../models/publisher.interface';
import { PublishersStore } from '../publishers/publishers.store';
import { CharactersState } from './characters-state.interface';

export function withCharactersCoreFeature() {
    return signalStoreFeature(
        { state: type<CharactersState>() },

        withEntities<Character>(),

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
            const charactersApiService = inject(CharactersApiService);
            const teamsApiService = inject(TeamsApiService);
            const publishersStore = inject(PublishersStore);
            const booksApiService = inject(BooksApiService);

            return {
                async setActiveCharacter(characterId: number) {
                    const teamIds =
                        await teamsApiService.selectByCharacter(characterId);
                    const bookIds =
                        await booksApiService.searchByCharacter(characterId);

                    patchState(store, {
                        activeCharacter: {
                            teamIds,
                            characterId,
                            bookIds,
                        },
                    });
                },

                clearActiveCharacter() {
                    patchState(store, {
                        activeCharacter: {
                            teamIds: [],
                            characterId: undefined,
                            bookIds: [],
                        },
                    });
                },

                async selectByBook(bookId: number) {
                    const ids = await charactersApiService.selectByBook(bookId);
                    return ids.map((id) => store.entityMap()[id]);
                },

                async selectIdsByBook(bookId: number): Promise<number[]> {
                    return await charactersApiService.selectByBook(bookId);
                },

                async loadIdsByTeam(teamId: number): Promise<number[]> {
                    return await charactersApiService.selectByTeam(teamId);
                },

                async loadCharacters() {
                    const characters =
                        await charactersApiService.fetchCharacters();
                    const names = characters.reduce(
                        (acc, c) => ({
                            ...acc,
                            [c.name.trim().toLocaleLowerCase()]: c.id,
                        }),
                        {},
                    );

                    patchState(store, setAllEntities(characters), {
                        loaded: true,
                        names,
                    });
                },

                async removeCharacter(characterId: number) {
                    await charactersApiService.deleteCharacter(characterId);
                    patchState(store, removeEntity(characterId));
                },

                async importCharacter(data: CharacterResult): Promise<number> {
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
                        image,
                        origin: data.origin,
                        powers: data.powers,
                        publisherId: publisherId,
                        realName: data.realName,
                        summary: data.summary,
                    };

                    return await this.addCharacter(newChar);
                },

                async updateCharacter(
                    id: number,
                    char: Partial<Character>,
                    teamIds: number[],
                ) {
                    await charactersApiService.updateCharacter(
                        id,
                        char,
                        teamIds,
                    );
                    patchState(store, updateEntity({ id: id, changes: char }));
                },

                async addCharacter(
                    character: Omit<Character, 'id'>,
                ): Promise<number> {
                    const existingId =
                        store.names()[
                            character.name.trim().toLocaleLowerCase()
                        ];

                    if (existingId) {
                        return existingId;
                    }

                    const added =
                        await await charactersApiService.insertCharacter(
                            character,
                        );

                    patchState(store, addEntity(added), {
                        names: {
                            ...store.names(),
                            [added.name.trim().toLocaleLowerCase()]: added.id,
                        },
                    });

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

        withHooks({
            async onInit(store) {
                await store.loadCharacters();
            },
        }),
    );
}
