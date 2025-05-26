export interface LocationDto {
    id: number;
    name: string;
    description?: string;
    dateAdded: string;
    externalUrl?: string;
    externalId?: number;
    image?: ArrayBuffer;
}
