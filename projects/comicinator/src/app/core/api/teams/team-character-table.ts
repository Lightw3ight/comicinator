import { Table } from '../../sql/table';

export const TeamCharacterTable = new Table<{
    teamId: number;
    characterId: number;
}>('TeamCharacter');
