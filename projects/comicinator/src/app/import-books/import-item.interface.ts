import { BookResult } from '../core/api/comic-vine/models/book-result.interface';
import { VolumeResult } from '../core/api/comic-vine/models/volume-result.interface';

export interface ImportItem {
    filePath: string;
    outputPath: string;
    name: string;
    year?: string;
    issueNumber?: number;
    issue?: BookResult;
    volume?: VolumeResult;
    selected: boolean;
}
