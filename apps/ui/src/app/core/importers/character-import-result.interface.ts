import { Character } from '../models/character.interface';

export interface CharacterImportResult {
    character: Partial<Character>;
    image: Blob | undefined;
    teamIds: number[];
}
