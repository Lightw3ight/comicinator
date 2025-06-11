import { ItemBaseDto } from './item-base-dto.interface';

export interface ApiResponseDto<T extends ItemBaseDto | ItemBaseDto[]> {
    error: string;
    limit: number;
    number_of_page_results: number;
    number_of_total_results: number;
    offset: number;
    status_code: number;
    results: T;
}
