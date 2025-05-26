import { Character } from '../../models/character.interface';
import { Table } from '../../sql/table';

export const CharacterTable = new Table<Character>('Character', 'id');
