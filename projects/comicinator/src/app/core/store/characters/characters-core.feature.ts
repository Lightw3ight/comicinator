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
import { CharactersApiService } from '../../api/characters/characters-api.service';
import { Character } from '../../models/character.interface';
import { CharactersState } from './characters-state.interface';

export function withCharactersCoreFeature() {
    return signalStoreFeature(
        { state: type<CharactersState>() },

        withEntities<Character>(),

        withMethods((store) => {
            const charactersApiService = inject(CharactersApiService);

            return {
                async loadCharacters() {
                    const characters =
                        await charactersApiService.fetchCharacters();
                    const names = characters.reduce(
                        (acc, c) => ({
                            ...acc,
                            [c.name.trim().toLocaleLowerCase()]: c.id,
                        }),
                        {}
                    );

                    patchState(store, setAllEntities(characters), {
                        loaded: true,
                        names,
                    });
                },

                async addCharacter(
                    character: Omit<Character, 'id'>
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
                            character
                        );

                    patchState(store, addEntity(added), { names: {
                        ...store.names(),
                        [added.name.trim().toLocaleLowerCase()]: added.id,
                    } });

                    return added.id;
                },

                async addCharactersByName(characters: string | undefined) {
                    if (characters == null || characters.trim().length === 0) {
                        return [];
                    }

                    const names = characters.split(',').map((c) => c.trim());
                    const characterIds: number[] = [];

                    for (let name of names) {
                        const id = await this.addCharacter({ name });
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
        })
    );
}
