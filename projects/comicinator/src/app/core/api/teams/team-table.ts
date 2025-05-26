import { Team } from '../../models/team.interface';
import { Table } from '../../sql/table';

export const TeamTable = new Table<Team>('Team', 'id');
