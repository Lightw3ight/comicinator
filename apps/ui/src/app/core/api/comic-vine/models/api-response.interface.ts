import { ItemBase } from './item-base.interface';

export interface ApiResponse<T extends ItemBase | ItemBase[]> {
    pageSize: number;
    currentPageSize: number;
    totalResults: number;
    offset: number;
    results: T;
}
