export interface Team {
    id: number;
    name: string;
    dateAdded: Date;
    aliases?: string;
    summary?: string;
    description?: string;
    publisher?: string;
    url?: string;
}