import { Gender } from './gender.enum';

export interface Character {
    id: number;
    name: string;
    aliases?: string;
    creators?: string;
    description?: string;
    gender?: Gender;
    origin?: string;
    powers?: string;
    publisherId?: number;
    realName?: string;
    externalUrl?: string;
    externalId?: number;
    birthDate?: Date;
    dateAdded: Date;
    lastUpdated?: Date;
}
