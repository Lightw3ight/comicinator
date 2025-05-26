import { inject } from '@angular/core';
import {
    patchState,
    signalStoreFeature,
    type,
    withMethods,
} from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { CharactersApiService } from '../../api/characters/characters-api.service';
import { Character } from '../../models/character.interface';
import { CharactersState } from './characters-state.interface';

export function withCharactersSearchFeature() {
    return signalStoreFeature(
        { state: type<CharactersState>() },

        withMethods((store) => {
            const charactersApiService = inject(CharactersApiService);

            return {
                async search(query: string) {
                    const ids =
                        await charactersApiService.searchCharacters(query);

                    patchState(store, {
                        activeSearch: {
                            query,
                            results: ids,
                        },
                    });
                },

                clearSearch() {
                    patchState(store, {
                        activeSearch: {
                            query: undefined,
                            results: [],
                        },
                    });
                },
            };
        }),
    );
}
