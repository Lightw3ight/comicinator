import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { MessagingService } from '../../messaging/messaging.service';
import { SettingsStore } from '../../store/settings/settings.store';
import { ApiResponseDto } from './dto/api-response-dto.interface';
import { BookResultDto } from './dto/book-result-dto.interface';
import { CharacterResultDto } from './dto/character-result-dto.interface';
import { ImageResultDto } from './dto/image-result.dto';
import { ItemBaseDto } from './dto/item-base-dto.interface';
import { LocationResultDto } from './dto/location-result-dto.interface';
import { PersonStubDto } from './dto/person-stub-dto.interface';
import { TeamResultDto } from './dto/team-result-dto.interface';
import { VolumeResultDto } from './dto/volume-result-dto.interface';
import { ApiResponse } from './models/api-response.interface';
import { BookResult } from './models/book-result.interface';
import { CharacterResult } from './models/character-result.interface';
import { ImageResult } from './models/image-result';
import { ItemBase } from './models/item-base.interface';
import { LocationResult } from './models/location-result.interface';
import { PersonStub } from './models/person-stub.interface';
import { TeamResult } from './models/team-result.interface';
import { VolumeResult } from './models/volume-result.interface';

export const API_TYPES = {
    character: '4005',
    volume: '4050',
    issue: '4000',
    team: '4060',
    location: '4020',
};

// export const BASE_URL = (path: string, args?: { [key: string]: string }) => {
//     let query = '';

//     if (args) {
//         query =
//             '&' +
//             Object.entries(args)
//                 .reduce<string[]>((acc, [key, value]) => {
//                     return [...acc, `${key}=${value}`];
//                 }, [])
//                 .join('&');
//     }
//     return `https://comicvine.gamespot.com/api/${path}/?api_key=${API_KEY}&format=json${query}`;
// };

@Injectable({ providedIn: 'root' })
export class ComicVineService {
    private http = inject(HttpClient);
    private settingsStore = inject(SettingsStore);
    private messagingService = inject(MessagingService);

    private makeUrl(path: string, args?: { [key: string]: string }) {
        let query = '';

        if (args) {
            query =
                '&' +
                Object.entries(args)
                    .reduce<string[]>((acc, [key, value]) => {
                        return [...acc, `${key}=${value}`];
                    }, [])
                    .join('&');
        }
        return `https://comicvine.gamespot.com/api/${path}/?api_key=${this.settingsStore.settings.apiKey()}&format=json${query}`;
    }

    public async searchBooks(
        name: string | undefined,
        volume: string | number | undefined,
        issueNumber: string | number | undefined,
        offset?: number,
    ): Promise<ApiResponse<BookResult[]>> {
        const filter = {
            name,
            volume,
            issue_number: issueNumber,
        };

        const filterQuery = Object.entries(filter)
            .filter(([, value]) => value != null)
            .map(([key, value]) => `${key}:${value}`)
            .join(',');

        const url = this.makeUrl('issues', {
            filter: filterQuery,
            sort: 'cover_date:asc',
            offset: (offset ?? 0).toString(),
        });
        const response = await firstValueFrom(
            this.http.get<ApiResponseDto<BookResultDto[]>>(url),
        );

        return this.mapApiResponse(response, (items) =>
            items.map(this.mapBookResult),
        );
    }

    public async getBook(id: number) {
        const url = this.makeUrl(`issue/${API_TYPES.issue}-${id}`);
        const response = await firstValueFrom(
            this.http.get<ApiResponseDto<BookResultDto>>(url),
        );
        return this.mapBookResult(response.results);
    }

    // public async searchVolumesWithYear(name: string, year?: string) {
    //     const filters = {
    //         name,
    //         start_year: year,
    //     };
    //     const filterQuery = Object.entries(filters)
    //         .filter(([, value]) => value != null)
    //         .map(([key, value]) => `${key}:${value}`)
    //         .join(',');
    //     const url = this.makeUrl('volumes', {
    //         filter: filterQuery,
    //         // sort: 'date_added:desc',
    //     });
    //     const response = await firstValueFrom(
    //         this.http.get<ApiResponseDto<VolumeResultDto[]>>(url)
    //     );

    //     return response.results.map(this.mapVolumeResult);
    // }

    public async searchVolumes(name: string) {
        const url = this.makeUrl('search', {
            query: name,
            limit: '100',
            resources: 'volume',
        });
        const response = await firstValueFrom(
            this.http.get<ApiResponseDto<VolumeResultDto[]>>(url),
        );

        return response.results.map(this.mapVolumeResult);
    }

    public async searchLocations(name: string): Promise<LocationResult[]> {
        const filter = isNaN(Number(name)) ? `name:${name}` : `id:${name}`;
        const url = this.makeUrl('locations', {
            filter,
            sort: 'name:desc',
        });
        return firstValueFrom(
            this.http
                .get<ApiResponseDto<LocationResultDto[]>>(url)
                .pipe(
                    map((result) => result.results.map(this.mapLocationResult)),
                ),
        );
    }

    public async searchCharacters(name: string): Promise<CharacterResult[]> {
        const filter = isNaN(Number(name)) ? `name:${name}` : `id:${name}`;
        const url = this.makeUrl('characters', {
            filter,
            sort: 'name:desc',
        });
        return firstValueFrom(
            this.http
                .get<ApiResponseDto<CharacterResultDto[]>>(url)
                .pipe(
                    map((result) =>
                        result.results.map(this.mapCharacterResult),
                    ),
                ),
        );
    }

    public async searchTeams(name: string): Promise<TeamResult[]> {
        const filter = isNaN(Number(name)) ? `name:${name}` : `id:${name}`;
        const url = this.makeUrl('teams', {
            filter,
            sort: 'name:desc',
        });
        return firstValueFrom(
            this.http
                .get<ApiResponseDto<TeamResultDto[]>>(url)
                .pipe(map((result) => result.results.map(this.mapTeamResult))),
        );
    }

    public async getCharacter(id: number) {
        const url = this.makeUrl(`character/${API_TYPES.character}-${id}`);
        const response = await firstValueFrom(
            this.http.get<ApiResponseDto<CharacterResultDto>>(url),
        );
        return this.mapCharacterResult(response.results);
    }

    public async getLocation(id: number) {
        const url = this.makeUrl(`location/${API_TYPES.location}-${id}`);
        const response = await firstValueFrom(
            this.http.get<ApiResponseDto<LocationResultDto>>(url),
        );
        return this.mapLocationResult(response.results);
    }

    public async getTeam(id: number) {
        const url = this.makeUrl(`team/${API_TYPES.team}-${id}`);

        const message = () =>
            `Encountered an error while fetching team, retry?`;
        const response = await this.messagingService.runWithRetry(
            () =>
                firstValueFrom(
                    this.http.get<ApiResponseDto<TeamResultDto>>(url),
                ),
            message,
        );

        if (response == null) {
            throw new Error(`Error fetching team with id ${id}`);
        }

        return this.mapTeamResult(response.results);
    }

    private mapCharacterResult = (dto: CharacterResultDto): CharacterResult => {
        return {
            ...this.mapItemBase(dto),
            realName: dto.real_name,
            aliases: dto.aliases?.replaceAll('\n', ', '),
            appearanceCount: dto.count_of_issue_appearances,
            publisher: dto.publisher
                ? this.mapItemBase(dto.publisher)
                : undefined,
            birth: dto.birth ? new Date(dto.birth) : undefined,
            dateAdded: this.mapDate(dto.date_added)!,
            dateLastUpdated: this.mapDate(dto.date_last_updated)!,
            summary: dto.deck,
            description: dto.description,
            firstIssue: dto.first_appeared_in_issue?.name,
            gender: dto.gender,
            image: dto.image,
            powers: dto.powers?.map((p) => p.name).join(', '),
            origin: dto.origin?.name,
            creators: dto.creators?.map((o) => o.name).join(', '),
            teams: dto.teams?.map(this.mapItemBase),
        };
    };

    private mapBookResult = (dto: BookResultDto): BookResult => {
        return {
            ...this.mapItemBase(dto),
            image: this.mapImage(dto.image),
            aliases: dto.aliases,
            issueNumber: dto.issue_number,
            summary: dto.deck,
            description: dto.description,
            coverDate: this.mapDate(dto.cover_date),
            dateAdded: this.mapDate(dto.date_added),
            dateLastUpdated: this.mapDate(dto.date_last_updated),
            storeDate: this.mapDate(dto.store_date),
            hasStaffReview: dto.has_staff_review,
            volume: dto.volume ? this.mapItemBase(dto.volume) : undefined,
            associatedImages: dto.associated_images,
            characterCredits: dto.character_credits?.map(this.mapItemBase),
            personCredits: dto.person_credits?.map(this.mapPersonStub),
            teamCredits: dto.team_credits?.map(this.mapItemBase),
            locations: dto.location_credits?.map(this.mapItemBase),
        };
    };

    private mapVolumeResult = (dto: VolumeResultDto): VolumeResult => {
        return {
            ...this.mapItemBase(dto),
            image: dto.image,
            issueCount: dto.count_of_issues,
            publisher: dto.publisher
                ? this.mapItemBase(dto.publisher)
                : undefined,
            startYear: dto.start_year,
        };
    };

    private mapTeamResult = (dto: TeamResultDto): TeamResult => {
        return {
            ...this.mapItemBase(dto),
            image: this.mapImage(dto.image),
            aliases: dto.aliases,
            issueCount: dto.count_of_issue_appearances,
            dateAdded: this.mapDate(dto.date_added)!,
            description: dto.description,
            summary: dto.deck,
            lastUpdated: this.mapDate(dto.date_last_updated)!,
            memberCount: dto.count_of_team_members,
            publisher: dto.publisher
                ? this.mapItemBase(dto.publisher)
                : undefined,
            characters: dto.characters
                ? dto.characters.map(this.mapItemBase)
                : undefined,
            enemies: dto.character_enemies
                ? dto.character_enemies.map(this.mapItemBase)
                : undefined,
            friends: dto.character_friends
                ? dto.character_friends.map(this.mapItemBase)
                : undefined,
            issues: dto.issue_credits
                ? dto.issue_credits.map(this.mapItemBase)
                : undefined,
        };
    };

    private mapLocationResult = (dto: LocationResultDto): LocationResult => {
        return {
            ...this.mapItemBase(dto),
            aliases: dto.aliases,
            description: dto.deck,
            image: this.mapImage(dto.image),
            dateAdded: this.mapDate(dto.date_added)!,
        };
    };

    private mapDate(val: string | undefined) {
        return val == null ? undefined : new Date(val);
    }

    private mapImage = (dto: ImageResultDto): ImageResult => {
        return {
            iconUrl: dto.icon_url,
            mediumUrl: dto.medium_url,
            originalUrl: dto.original_url,
            screenLargeUrl: dto.screen_large_url,
            screenUrl: dto.screen_url,
            smallUrl: dto.small_url,
            superUrl: dto.super_url,
            thumbUrl: dto.thumb_url,
            tinyUrl: dto.tiny_url,
        };
    };

    private mapPersonStub = (dto: PersonStubDto): PersonStub => {
        return {
            ...this.mapItemBase(dto),
            role: dto.role,
        };
    };

    private mapItemBase(dto: ItemBaseDto): ItemBase {
        return {
            id: dto.id,
            name: dto.name,
            apiUrl: dto.api_detail_url,
            siteUrl: dto.site_detail_url,
        };
    }

    private mapApiResponse<
        T extends ItemBase | ItemBase[],
        Tdto extends ItemBaseDto | ItemBaseDto[],
    >(dto: ApiResponseDto<Tdto>, mapper: (dto: Tdto) => T): ApiResponse<T> {
        return {
            currentPageSize: dto.number_of_page_results,
            offset: dto.offset,
            pageSize: dto.limit,
            totalResults: dto.number_of_total_results,
            results: mapper(dto.results),
        };
    }
}
