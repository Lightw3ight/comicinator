import { ImageResultDto } from './image-result.dto';
import { ItemBaseDto } from './item-base-dto.interface';

export interface CharacterResultDto extends ItemBaseDto {
    aliases: string;
    birth: string | null;
    count_of_issue_appearances: number;
    date_added: string;
    date_last_updated: string;
    deck: string;
    description: string;
    first_appeared_in_issue: ItemBaseDto;
    gender: number; // male = 1
    image: ImageResultDto;
    character_enemies: ItemBaseDto[];
    character_friends: ItemBaseDto[];
    creators: ItemBaseDto[];
    origin: ItemBaseDto;
    publisher: ItemBaseDto;
    powers: ItemBaseDto[];
    teams: ItemBaseDto[];
    real_name: string;
}
