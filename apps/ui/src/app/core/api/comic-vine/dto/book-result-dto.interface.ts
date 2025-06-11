import { PersonStubDto } from './person-stub-dto.interface';
import { ImageResultDto } from './image-result.dto';
import { ItemBaseDto } from './item-base-dto.interface';

export interface BookResultDto extends ItemBaseDto {
    issue_number: string;
    deck: string;
    description: string;
    aliases: string;
    cover_date: string;
    date_added: string;
    date_last_updated: string;
    store_date: string;
    has_staff_review: boolean;
    image: ImageResultDto;
    volume: ItemBaseDto | undefined;
    associated_images: {
        original_url: string;
        id: number;
        caption: string;
        image_tags: string;
    }[];
    character_credits?: ItemBaseDto[];
    person_credits?: PersonStubDto[];
    team_credits?: ItemBaseDto[];
    location_credits?: ItemBaseDto[];
}
