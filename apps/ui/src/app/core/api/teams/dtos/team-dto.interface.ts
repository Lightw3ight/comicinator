export interface TeamDto {
    id: number;
    name: string;
    dateAdded: string;
    aliases?: string;
    summary?: string;
    description?: string;
    publisherId?: number;
    externalUrl?: string;
    externalId?: number;
    image: ArrayBuffer;
}
