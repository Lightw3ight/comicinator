import { ImageResultDto } from '../dto/image-result.dto';
import { ItemBase } from './item-base.interface';

export interface VolumeResult extends ItemBase {
    image: ImageResultDto;
    issueCount: number;
    publisher?: ItemBase;
    startYear: string;
}
