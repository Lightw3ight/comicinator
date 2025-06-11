import { ImageResult } from './image-result';
import { ItemBase } from './item-base.interface';

export interface TeamResult extends ItemBase {
    aliases: string;
    enemies?: ItemBase[];
    friends?: ItemBase[];
    characters?: ItemBase[];
    issueCount: number;
    memberCount: number;
    dateAdded: Date;
    lastUpdated: Date;
    summary: string;
    description: string;
    image: ImageResult;
    issues?: ItemBase[];
    publisher?: ItemBase;
}
