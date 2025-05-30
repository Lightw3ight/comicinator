import { SortDirection } from '../../core/models/sort-direction.type';

export interface SortConfig {
    field: string;
    dir: SortDirection;
}
