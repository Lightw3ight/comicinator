import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { CharacterResultDto } from './dto/character-result-dto.interface';
import { ApiResponse } from './dto/api-response.interface';
import { CharacterResult } from './models/character-result.interface';

export const API_KEY = 'f1cdfe708ce24e223b0dafd3229c41dd5ae05f04';
export const BASE_URL = (path: string, args?: { [key: string]: string }) => {
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
    return `https://comicvine.gamespot.com/api/${path}/?api_key=${API_KEY}&format=json${query}`;
};

// const headers = new HttpHeaders({
//     'api_key': API_KEY,
//     'Access-Control-Allow-Origin': '*',  // Allow all origins
//     // 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allowed methods,
//     // 'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Content-Range, Content-Disposition, Content-Description'
//   });

@Injectable({ providedIn: 'root' })
export class ComicVineService {
    private http = inject(HttpClient);
    constructor() {}

    public async searchIssues(name: string) {
        const url = BASE_URL('issues', {
            filter: `name:${name}`,
            sort: 'store_date:desc',
        });
        return firstValueFrom(this.http.get(url));
    }

    public async searchCharacters(name: string): Promise<CharacterResult[]> {
        const url = BASE_URL('characters', {
            filter: `name:${name}`,
            sort: 'name:desc',
        });
        return firstValueFrom(
            this.http
                .get<ApiResponse<CharacterResultDto>>(url)
                .pipe(
                    map((result) => result.results.map(this.mapCharacterResult))
                )
        );
    }

    private mapCharacterResult(dto: CharacterResultDto): CharacterResult {
        return {
            id: dto.id,
            name: dto.name,
            realName: dto.real_name,
            aliases: dto.aliases,
            appearanceCount: dto.count_of_issue_appearances,
            publisher: dto.publisher?.name,
            birth: dto.birth ? new Date(dto.birth) : null,
            dateAdded: new Date(dto.date_added),
            dateLastUpdated: new Date(dto.date_last_updated),
            apiDetailUrl: dto.api_detail_url,
            summary: dto.deck,
            description: dto.description,
            firstIssue: dto.first_appeared_in_issue?.name,
            gender: dto.gender,
            image: dto.image,
            siteDetailUrl: dto.site_detail_url,
        };
    }
}
