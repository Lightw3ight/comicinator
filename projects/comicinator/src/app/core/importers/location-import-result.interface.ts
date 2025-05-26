import { Location } from '../models/location.interface';

export interface LocationImportResult {
    location: Partial<Location>;
    image: Blob;
}
