import { ImageResult } from './image-result';
import { ItemBase } from './item-base.interface';

export interface LocationResult extends ItemBase {
    aliases?: string;
    dateAdded?: Date;
    description?: string;
    image: ImageResult;
}
