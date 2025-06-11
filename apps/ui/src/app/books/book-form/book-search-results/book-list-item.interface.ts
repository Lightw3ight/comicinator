import { VolumeResult } from '../../../core/api/comic-vine/models/volume-result.interface';

export interface BookListItem {
    id: number;
    name: string;
    publisher?: string;
    issueCount: number;
    startYear: string;
    data: VolumeResult;
}
