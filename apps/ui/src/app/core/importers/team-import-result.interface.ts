import { Team } from '../models/team.interface';

export interface TeamImportResult {
    team: Partial<Team>;
    characterIds?: number[];
    image: Blob | undefined;
}
