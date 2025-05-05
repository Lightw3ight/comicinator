import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export const API_KEY = 'f1cdfe708ce24e223b0dafd3229c41dd5ae05f04';
export const BASE_URL = (path: string, args?: { [key: string]: string }) => {
    let query = '';

    if (args) {
        query = '&' + Object.entries(args).reduce<string[]>((acc, [key, value]) => {
            return [...acc, `${key}=${value}`]
        }, []).join('&');
    }
    return `https://comicvine.gamespot.com/api/${path}/?api_key=${API_KEY}&format=json${query}`
};

// const headers = new HttpHeaders({
//     'api_key': API_KEY,
//     'Access-Control-Allow-Origin': '*',  // Allow all origins
//     // 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allowed methods,
//     // 'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Content-Range, Content-Disposition, Content-Description'
//   });


@Injectable({providedIn: 'root'})
export class ComicVineService {
    private http = inject(HttpClient);
    constructor() { }
    
    public async searchIssues(name: string) {
        const url = BASE_URL('issues', { filter: `name:${name}`, sort: 'store_date:desc' });
        return firstValueFrom(this.http.get(url));
    }
}