export interface Team {
    id: number;
    name: string;
    dateAdded: Date;
    aliases?: string;
    summary?: string;
    description?: string;
    publisherId?: number;
    externalUrl?: string;
    externalId?: number;
    image?: Blob;
}
