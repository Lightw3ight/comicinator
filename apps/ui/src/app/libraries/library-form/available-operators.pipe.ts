import { Pipe, PipeTransform } from '@angular/core';
import { FilterOperator } from '../../core/models/filter-operator.type';
import { FILTER_FIELD_OPTIONS } from './filter-field-details';

@Pipe({
    name: 'availableOperators',
})
export class AvailableOperatorsPipe implements PipeTransform {
    public transform(field: string): FilterOperator[] {
        return FILTER_FIELD_OPTIONS[field]?.allowedOperators ?? [];
    }
}
