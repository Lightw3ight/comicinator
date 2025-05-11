export interface TeamDto {
    id: number;
    name: string;
    dateAdded: string;
    aliases?: string;
    summary?: string;
    description?: string;
    publisher?: string;
    url?: string;
}