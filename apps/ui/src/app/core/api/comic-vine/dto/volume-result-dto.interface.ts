import { ImageResultDto } from './image-result.dto';
import { ItemBaseDto } from './item-base-dto.interface';

export interface VolumeResultDto extends ItemBaseDto {
    aliases: string;
    deck: string;
    description: string;
    count_of_issues: number;
    date_added: string;
    date_last_updated: string;
    first_issue: ItemBaseDto;
    image: ImageResultDto;
    last_issue: ItemBaseDto;
    publisher: ItemBaseDto;
    start_year: string;
}
