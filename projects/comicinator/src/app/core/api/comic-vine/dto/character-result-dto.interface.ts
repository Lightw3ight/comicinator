export interface CharacterResultDto {
    id: number;
    name: string;
    aliases: string;
    api_detail_url: string;
    birth: string | null;
    count_of_issue_appearances: number;
    date_added: string;
    date_last_updated: string;
    deck: string;
    description: string;
    first_appeared_in_issue: {
        api_detail_url: string;
        id: number;
        issue_number: string;
        name: string;
    };
    gender: number; // male = 1
    image: {
        icon_url: string;
        image_tags: string;
        medium_url: string;
        original_url: string;
        screen_large_url: string;
        screen_url: string;
        small_url: string;
        super_url: string;
        thumb_url: string;
        tiny_url: string;
    };
    origin: {
        api_detail_url: string;
        id: number;
        name: string;
    };
    publisher: {
        api_detail_url: string;
        id: number;
        name: string;
    };
    real_name: string;
    site_detail_url: string;
}

// "image": {
//                 "icon_url": "https:\/\/comicvine.gamespot.com\/a\/uploads\/square_avatar\/11114\/111147698\/5279390-5277701-elseworlds_batman_2.jpg",
//                 "medium_url": "https:\/\/comicvine.gamespot.com\/a\/uploads\/scale_medium\/11114\/111147698\/5279390-5277701-elseworlds_batman_2.jpg",
//                 "screen_url": "https:\/\/comicvine.gamespot.com\/a\/uploads\/screen_medium\/11114\/111147698\/5279390-5277701-elseworlds_batman_2.jpg",
//                 "screen_large_url": "https:\/\/comicvine.gamespot.com\/a\/uploads\/screen_kubrick\/11114\/111147698\/5279390-5277701-elseworlds_batman_2.jpg",
//                 "small_url": "https:\/\/comicvine.gamespot.com\/a\/uploads\/scale_small\/11114\/111147698\/5279390-5277701-elseworlds_batman_2.jpg",
//                 "super_url": "https:\/\/comicvine.gamespot.com\/a\/uploads\/scale_large\/11114\/111147698\/5279390-5277701-elseworlds_batman_2.jpg",
//                 "thumb_url": "https:\/\/comicvine.gamespot.com\/a\/uploads\/scale_avatar\/11114\/111147698\/5279390-5277701-elseworlds_batman_2.jpg",
//                 "tiny_url": "https:\/\/comicvine.gamespot.com\/a\/uploads\/square_mini\/11114\/111147698\/5279390-5277701-elseworlds_batman_2.jpg",
//                 "original_url": "https:\/\/comicvine.gamespot.com\/a\/uploads\/original\/11114\/111147698\/5279390-5277701-elseworlds_batman_2.jpg",
//                 "image_tags": "All Images"
//             },
