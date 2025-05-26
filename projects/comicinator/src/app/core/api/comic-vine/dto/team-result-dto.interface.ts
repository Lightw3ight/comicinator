import { ImageResultDto } from './image-result.dto';
import { ItemBaseDto } from './item-base-dto.interface';

export interface TeamResultDto extends ItemBaseDto {
    aliases: string;
    character_enemies: ItemBaseDto[];
    character_friends: ItemBaseDto[];
    characters: ItemBaseDto[];
    count_of_issue_appearances: number;
    count_of_team_members: number;
    date_added: string;
    date_last_updated: string;
    deck: string;
    description: string;
    disbanded_in_issues: ItemBaseDto[];
    first_appeared_in_issue?: ItemBaseDto;
    image: ImageResultDto;
    issue_credits: ItemBaseDto[];
    issues_disbanded_in: ItemBaseDto[];
    publisher: ItemBaseDto;
    story_arc_credits: ItemBaseDto[];
    volume_credits: ItemBaseDto[];
}
