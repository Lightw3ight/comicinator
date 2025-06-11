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
import { PublishersApiService } from '../../api/publishers/publishers-api.service';
import { Publisher } from '../../models/publisher.interface';
import { PublishersState } from './publishers-state.interface';

export function withPublishersCoreFeature() {
    return signalStoreFeature(
        { state: type<PublishersState>() },

        withEntities<Publisher>(),

        withMethods((store) => {
            const publishersApiService = inject(PublishersApiService);

            return {
                findPublisher(externalId: number | undefined, name: string) {
                    let result =
                        store
                            .entities()
                            .find((o) => o.externalId === externalId) ??
                        store
                            .entities()
                            .find(
                                (o) =>
                                    o.name.toLocaleLowerCase() ===
                                    name.toLocaleLowerCase(),
                            );

                    return result;
                },

                async loadPublishers() {
                    const publishers = await publishersApiService.selectAll();

                    patchState(store, setAllEntities(publishers), {
                        loaded: true,
                    });
                },

                async addPublisher(
                    publisher: Omit<Publisher, 'id' | 'dateAdded'>,
                ): Promise<number> {
                    const added = await await publishersApiService.create({
                        ...publisher,
                        dateAdded: new Date(),
                    });

                    patchState(store, addEntity(added));

                    return added.id;
                },

                async addPublisherByName(name: string | undefined) {
                    if (name == null || name.trim().length === 0) {
                        return undefined;
                    }

                    const existing = await publishersApiService.findForImport(
                        null,
                        name,
                    );

                    if (existing) {
                        return existing.id;
                    }

                    const id = await this.addPublisher({
                        name,
                    });

                    return id;
                },
            };
        }),

        withHooks({
            async onInit(store) {
                await store.loadPublishers();
            },
        }),
    );
}
