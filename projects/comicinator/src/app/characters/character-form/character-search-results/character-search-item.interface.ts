import { CharacterResult } from '../../../core/api/comic-vine/models/character-result.interface';

export interface CharacterSearchItem {
    name: string;
    realName: string;
    publisher?: string;
    data: CharacterResult;
}
