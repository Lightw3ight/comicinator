import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { addEntities, EntityState } from '@ngrx/signals/entities';
import { CharactersApiService } from '../../api/characters/characters-api.service';
import { Character } from '../../models/character.interface';
import { CharactersState } from './characters-state.interface';

export function withCharactersSearchFeature() {
    return signalStoreFeature(
        { state: type<CharactersState & EntityState<Character>>() },

        withMethods((store) => {
            const charactersApiService = inject(CharactersApiService);

            return {
                async searchByTeam(teamId: number) {
                    const characters =
                        await charactersApiService.selectByTeam(teamId);
                    patchState(store, addEntities(characters));
                    return characters;
                },

                async quickFind(query: string) {
                    const items = await charactersApiService.selectMany(query);
                    patchState(store, addEntities(items));
                    return items;
                },
            };
        }),
    );
}
