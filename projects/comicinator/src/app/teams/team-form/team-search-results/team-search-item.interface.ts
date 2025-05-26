import { TeamResult } from '../../../core/api/comic-vine/models/team-result.interface';

export interface TeamSearchItem {
    name: string;
    publisher?: string;
    data: TeamResult;
    memberCount: number | undefined;
}
