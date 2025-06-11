export interface Team {
    id: number;
    name: string;
    dateAdded: Date;
    aliases?: string;
    description?: string;
    publisherId?: number;
    externalUrl?: string;
    externalId?: number;
    lastUpdated?: Date;
}
