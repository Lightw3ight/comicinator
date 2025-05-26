import { ImageResult } from './image-result';
import { ItemBase } from './item-base.interface';
import { PersonStub } from './person-stub.interface';

export interface BookResult extends ItemBase {
    aliases: string;
    issueNumber: number;
    summary: string;
    description: string;
    coverDate?: Date;
    dateAdded?: Date;
    dateLastUpdated?: Date;
    storeDate?: Date;
    hasStaffReview: boolean;
    image: ImageResult;
    volume?: ItemBase;
    associatedImages: {
        original_url: string;
        id: number;
        caption: string;
        image_tags: string;
    }[];
    characterCredits?: ItemBase[];
    personCredits?: PersonStub[];
    teamCredits?: ItemBase[];
    locations?: ItemBase[];
}
