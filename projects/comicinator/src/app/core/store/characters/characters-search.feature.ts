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

        withEntities<Character>(),

        withMethods((store) => {
            const charactersApiService = inject(CharactersApiService);

            return {
                async searchSharacters(search: string) {
                    const ids = await charactersApiService.searchSharacters(
                        search
                    );

                    patchState(store, {
                        currentSearch: search,
                        searchIds: ids,
                    });
                },

                clearSearch() {
                    if (store.currentSearch().length) {
                        patchState(store, { currentSearch: '', searchIds: [] });
                    }
                },
            };
        })
    );
}
