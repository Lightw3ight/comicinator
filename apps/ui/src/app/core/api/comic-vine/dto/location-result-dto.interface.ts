import { ImageResultDto } from './image-result.dto';
import { ItemBaseDto } from './item-base-dto.interface';

export interface LocationResultDto extends ItemBaseDto {
    aliases?: string;
    date_added?: string;
    deck?: string;
    image: ImageResultDto;
}
