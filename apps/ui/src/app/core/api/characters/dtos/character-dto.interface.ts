export interface CharacterDto {
    id: number;
    name: string;
    aliases?: string;
    creators?: string;
    summary?: string;
    description?: string;
    gender?: number;
    origin?: string;
    powers?: string;
    publisherId?: number;
    realName?: string;
    birthDate?: string;
    dateAdded: string;
    image: ArrayBuffer;
    externalUrl?: string;
    externalId?: number;
}
